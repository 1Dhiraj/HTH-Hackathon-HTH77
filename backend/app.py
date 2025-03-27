from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import re
import sys
import subprocess
import google.generativeai as genai
from fastapi import UploadFile, File
from PIL import Image 
import io 
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
import os
import groq
from datetime import datetime

load_dotenv()

GROQ_API_KEY = os.getenv("groq_api_key")
API_KEY = os.getenv("api_key")  # Keeping Gemini API key for image analysis

# Configure Groq
groq_client = groq.Groq(api_key=GROQ_API_KEY)

# Configure Google Generative AI for image analysis
genai.configure(api_key=API_KEY)
vision_model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class UserInput(BaseModel):
    prompt: str
    requirements: list[str] = []
    type: str = "web"
    framework: str = "vanilla"
    existingCode: dict = None
    modificationType: str = None
    timeout: int = 300
    temperature: float = 0.7

def parse_css_rules(css_text: str) -> dict:
    """Parse CSS text into a structured dictionary of rules."""
    rules = {}
    css_text = re.sub(r'/\*.*?\*/', '', css_text, flags=re.DOTALL)
    css_text = re.sub(r'\s+', ' ', css_text.strip())
    
    brackets_count = 0
    current_selector = ""
    current_properties = ""
    
    for char in css_text:
        if char == '{':
            if brackets_count == 0:
                current_selector = current_selector.strip()
            brackets_count += 1
            if brackets_count == 1:
                continue
        elif char == '}':
            brackets_count -= 1
            if brackets_count == 0:
                rules[current_selector] = parse_css_properties(current_properties.strip())
                current_selector = ""
                current_properties = ""
                continue
        
        if brackets_count == 0:
            current_selector += char
        else:
            current_properties += char
            
    return rules

def parse_css_properties(properties_text: str) -> dict:
    """Parse CSS properties string into a dictionary."""
    properties = {}
    for prop in properties_text.split(';'):
        prop = prop.strip()
        if not prop:
            continue
        if ':' in prop:
            key, value = prop.split(':', 1)
            properties[key.strip()] = value.strip()
    return properties

async def run_groq(prompt: str, temperature: float = 0.7):
    """Run Groq model with the given prompt."""
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a web development expert specializing in generating clean, modern web code."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="deepseek-r1-distill-llama-70b",
            temperature=temperature,
            max_tokens=4096
        )
        
        return chat_completion.choices[0].message.content, None, 0
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error running Groq: {str(e)}"
        )

def construct_modification_prompt(user_input: UserInput):
    """Constructs an enhanced modification prompt for Groq."""
    html_elements = re.findall(r'<(\w+)[^>]*>', user_input.existingCode.get('html', ''))
    js_functions = re.findall(r'function\s+(\w+)', user_input.existingCode.get('javascript', ''))
    css_classes = re.findall(r'\.(\w+)', user_input.existingCode.get('css', ''))

    base_prompt = f"""Act as a web development expert. Please modify the existing code based on this request: {user_input.prompt}

IMPORTANT GUIDELINES:
1. Preserve ALL existing styles and functionality
2. Only add or modify the specific styles or elements mentioned in the request
3. Return complete, unmodified sections for HTML/JS if they don't need changes
4. For CSS changes:
   - Keep all existing CSS rules intact
   - Only modify the specific properties mentioned
   - Add new rules without removing existing ones

Existing Elements Analysis:
- HTML elements: {', '.join(set(html_elements[:10]))}...
- JavaScript functions: {', '.join(set(js_functions[:10]))}...
- CSS classes: {', '.join(set(css_classes[:10]))}...

Current Code:

```html
{user_input.existingCode.get('html', '')}
```

```css
{user_input.existingCode.get('css', '')}
```

```javascript
{user_input.existingCode.get('javascript', '')}
```

Return the complete code with your specific modifications in clearly marked sections using the exact format below:
```html
[Your HTML code here]
```

```css
[Your CSS code here]
```

```javascript
[Your JavaScript code here]
```"""

    return base_prompt

def construct_new_code_prompt(user_input: UserInput):
    """Constructs a prompt for generating new code using Groq."""
    if "similar to this image" in user_input.prompt.lower():
        return f"""Act as a web development expert. Generate complete website code matching this description:
{user_input.prompt}

Requirements:
- Pixel-perfect layout matching
- Responsive design
- Modern CSS (Flexbox/Grid)
- Semantic HTML
- Interactive elements where appropriate

Return the code in the exact format below:
```html
[Your HTML code here]
```

```css
[Your CSS code here]
```

```javascript
[Your JavaScript code here]
```"""

    base_templates = {
        "web": (
            "Create a web application following these guidelines:\n"
            "1. Semantic HTML5 structure\n"
            "2. Modern, responsive CSS\n"
            "3. Clean JavaScript with error handling\n"
            "4. Cross-browser compatible\n"
            "5. Performance optimized"
        ),
        "game": (
            "Create a browser game with:\n"
            "1. Clean JavaScript architecture\n"
            "2. Game state management\n"
            "3. User input handling\n"
            "4. Victory/loss conditions\n"
            "5. Error handling\n"
            "6. Responsive design"
        )
    }

    base_prompt = base_templates.get(user_input.type, base_templates["web"])
    requirements = (
        "\n".join(f"- {req}" for req in user_input.requirements)
        if user_input.requirements else "- Standard implementation"
    )
    
    return (
        f"Act as a web development expert. Create code for this request: {user_input.prompt}\n\n"
        f"Requirements:\n{requirements}\n\n"
        f"{base_prompt}\n\n"
        "Return the code in the exact format below:\n"
        "```html\n[Your HTML code here]\n```\n\n"
        "```css\n[Your CSS code here]\n```\n\n"
        "```javascript\n[Your JavaScript code here]\n```"
    )

def clean_text(text: str) -> str:
    """Clean and sanitize text output from Groq."""
    if not text:
        return ""
    text = ''.join(char for char in text if ord(char) < 128)
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', '', text)
    text = '\n'.join(line.strip() for line in text.split('\n'))
    return text.strip()

def extract_code_blocks(text: str) -> dict:
    """Extract code blocks from the Groq output."""
    blocks = {
        'html': '',
        'css': '',
        'javascript': ''
    }
    
    html_pattern = r'```html\s*(.*?)\s*```'
    css_pattern = r'```css\s*(.*?)\s*```'
    js_pattern = r'```javascript\s*(.*?)\s*```'
    
    html_match = re.search(html_pattern, text, re.DOTALL)
    css_match = re.search(css_pattern, text, re.DOTALL)
    js_match = re.search(js_pattern, text, re.DOTALL)
    
    if html_match:
        blocks['html'] = html_match.group(1).strip()
    if css_match:
        blocks['css'] = css_match.group(1).strip()
    if js_match:
        blocks['javascript'] = js_match.group(1).strip()
    
    return blocks

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Gemini Code Generation API</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px;
                }
                .endpoint {
                    background: #f5f5f5;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <h1>Gemini Code Generation API</h1>
            <p>Available endpoints:</p>
            
            <div class="endpoint">
                <h3>POST /generate-code</h3>
                <p>Generate new web application code using Gemini AI.</p>
            </div>
            
            <div class="endpoint">
                <h3>POST /modify-code</h3>
                <p>Modify existing web application code using Gemini AI.</p>
            </div>
            
            <div class="endpoint">
                <h3>POST /analyze-image</h3>
                <p>Analyze an image using Gemini Vision API.</p>
            </div>
            
            <p>For detailed API documentation, visit <a href="/docs">/docs</a></p>
        </body>
    </html>
    """

@app.post("/generate-code")
async def generate_code(user_input: UserInput):
    try:
        if not user_input.prompt.strip():
            raise HTTPException(status_code=400, detail="Empty prompt")
        
        if user_input.existingCode:
            full_prompt = construct_modification_prompt(user_input)
        else:
            full_prompt = construct_new_code_prompt(user_input)
        
        stdout, stderr, returncode = await run_groq(
            full_prompt,
            temperature=user_input.temperature
        )
        
        cleaned_output = clean_text(stdout)
        
        if not cleaned_output:
            raise HTTPException(status_code=500, detail="No code generated")
        
        code_blocks = extract_code_blocks(cleaned_output)
        
        if user_input.existingCode:
            for key in ['html', 'css', 'javascript']:
                if not code_blocks[key].strip():
                    code_blocks[key] = user_input.existingCode.get(key, '')
        
        code_blocks['combined'] = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Web Application</title>
    <style>
    {code_blocks['css']}
    </style>
</head>
<body>
    {code_blocks['html']}
    <script>
    {code_blocks['javascript']}
    </script>
</body>
</html>"""
        
        return {
            "code": code_blocks,
            "type": user_input.type,
            "framework": user_input.framework,
            "isModification": bool(user_input.existingCode)
        }
        
    except Exception as e:
        logging.error(f"Error in code generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/modify-code")
async def modify_code(user_input: UserInput):
    try:
        if not user_input.existingCode:
            raise HTTPException(status_code=400, detail="No existing code provided")
        
        # Add logging for diagnostics
        logging.debug(f"Modification Request Details:")
        logging.debug(f"Prompt: {user_input.prompt}")
        logging.debug(f"Modification Type: {user_input.modificationType}")
        
        # Construct modification prompt
        full_prompt = construct_modification_prompt(user_input)
        logging.debug(f"Full Prompt:\n{full_prompt}")
        
        # Run Groq with detailed error handling
        try:
            stdout, stderr, returncode = await run_groq(
                full_prompt,
                temperature=0.3
            )
        except Exception as groq_error:
            logging.error(f"Groq API Error: {str(groq_error)}")
            raise HTTPException(status_code=500, detail=f"Groq API Error: {str(groq_error)}")
        
        # More robust error checking
        if not stdout:
            logging.warning("No output received from Groq")
            return {
                "code": user_input.existingCode,
                "message": "No modifications suggested"
            }
        
        cleaned_output = clean_text(stdout)
        logging.debug(f"Cleaned Output:\n{cleaned_output}")
        
        code_blocks = extract_code_blocks(cleaned_output)
        
        # Fallback to existing code if no modifications
        for key in ['html', 'css', 'javascript']:
            if not code_blocks[key].strip():
                code_blocks[key] = user_input.existingCode.get(key, '')
        
        code_blocks['combined'] = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modified Web Application</title>
    <style>
    {code_blocks['css']}
    </style>
</head>
<body>
    {code_blocks['html']}
    <script>
    {code_blocks['javascript']}
    </script>
</body>
</html>"""
        
        return {"code": code_blocks}
        
    except Exception as e:
        logging.error(f"Comprehensive Modification Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        
        # Convert image to format compatible with Gemini
        img_bytes = io.BytesIO()
        img.save(img_bytes, format=img.format)
        img_bytes = img_bytes.getvalue()
        
        try:
            # Generate description using updated Gemini Vision model
            description_prompt = """Analyze this web design image and describe its structure. Include:
1. Layout structure
2. Color scheme
3. UI components
4. Typography
5. Special features"""
            
            vision_response = vision_model.generate_content([
                description_prompt,
                {"mime_type": f"image/{img.format.lower()}", "data": img_bytes}
            ])
            
            if not vision_response:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate description from image"
                )
                
            description = vision_response.text
            
        except Exception as vision_error:
            logging.error(f"Vision API error: {str(vision_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing image with Gemini Vision: {str(vision_error)}"
            )
        
        # Generate code using Gemini
        code_prompt = f"""Convert this web design description into HTML, CSS, and JavaScript code:
        
Design Description:
{description}

Generate complete code with:
1. Semantic HTML5 structure
2. Modern CSS (Flexbox/Grid)
3. Clean JavaScript
4. Responsive design
5. Accessibility features

Return the code in the exact format below:
```html
[Your HTML code here]
```

```css
[Your CSS code here]
```

```javascript
[Your JavaScript code here]
```"""

        code_output, _, _ = await run_groq(code_prompt)
        code_blocks = extract_code_blocks(code_output)
        
        code_blocks['combined'] = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated from Image</title>
    <style>
    {code_blocks['css']}
    </style>
</head>
<body>
    {code_blocks['html']}
    <script>
    {code_blocks['javascript']}
    </script>
</body>
</html>"""
        
        return {
            "image_info": {
                "width": img.size[0],
                "height": img.size[1],
                "format": img.format,
                "mode": img.mode
            },
            "description": description,
            "code": code_blocks
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Image analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing image: {str(e)}"
        )

@app.post("/parse-html")
async def parse_html(content: dict):
    try:
        html_content = content.get('html', '')
        
        # Parse HTML and extract components
        css = re.search(r'<style>(.*?)</style>', html_content, re.DOTALL)
        js = re.search(r'<script>(.*?)</script>', html_content, re.DOTALL)
        
        return {
            "code": {
                "html": re.sub(r'<style>.*?</style>|<script>.*?</script>', '', html_content, flags=re.DOTALL),
                "css": css.group(1).strip() if css else '',
                "javascript": js.group(1).strip() if js else '',
                "combined": html_content
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

        
@app.post("/ai-tutor")
async def ai_tutor(input_data: dict):
    try:
        prompt = input_data.get('prompt', '').strip().lower()  # Lowercase for easier matching
        context = input_data.get('context', 'web development')
        
        if not prompt:
            logging.warning("Empty prompt received")
            return {
                "status": "error",
                "message": "Please provide a valid question or prompt.",
                "response": None
            }
        
        # Check for simple greetings and respond formally
        greetings = ["hi", "hello", "hey", "hi there"]
        if prompt in greetings:
            logging.debug(f"Detected greeting: {prompt}")
            return {
                "status": "success",
                "context": context,
                "response": "Good day! How may I assist you with your web development inquiries today?",
                "timestamp": datetime.now().isoformat()
            }
        
        # Full prompt for non-greetings with formal tone
        full_prompt = f"""You are an AI tutor specializing in web development. 
Provide a formal, educational response to the following question, maintaining a professional and courteous tone:

Context: {context}
Question: {prompt}

Guidelines:
1. Explain concepts clearly and professionally for learners
2. Include practical examples where applicable
3. Present complex topics in an organized, step-by-step manner
4. Offer additional resources or guidance as appropriate

Response Format:
- Begin with a concise, formal explanation
- Provide a structured breakdown of steps
- Include a relevant code example if applicable
- Conclude with formal suggestions for further learning"""
        
        logging.debug(f"Sending prompt to Groq: {full_prompt}")
        stdout, stderr, returncode = await run_groq(full_prompt, temperature=0.7)
        logging.debug(f"Raw Groq Response: {stdout}")
        
        cleaned_response = clean_text(stdout)
        if not cleaned_response:
            logging.warning("Empty response from Groq after cleaning")
            return {
                "status": "error",
                "message": "Received an empty response from the AI",
                "response": None
            }
        
        logging.info("Successfully generated tutor response")
        return {
            "status": "success",
            "context": context,
            "response": cleaned_response,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logging.error(f"AI Tutor Error: {str(e)}", exc_info=True)
        return {
            "status": "error", 
            "message": f"An unexpected error occurred: {str(e)}",
            "response": None
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)