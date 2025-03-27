import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, Download, Youtube, Archive } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Ensure all YouTube links are properly formatted with valid IDs
const YOUTUBE_LINKS = [
  {
    title: "HTML Crash Course For Absolute Beginners",
    url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
  },
  {
    title: "CSS Crash Course For Absolute Beginners",
    url: "https://www.youtube.com/watch?v=yfoY53QXEnI",
  },
  {
    title: "JavaScript Crash Course For Beginners",
    url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
  },
  {
    title: "React JS Crash Course 2023",
    url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
  },
  {
    title: "Responsive Web Design Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=srvUrASNj0s",
  },
];

// Function to determine project type and generate relevant resource links
const getResourceLinks = (prompt, code) => {
  // Define resource categories with verified, working links
  const resources = {
    ecommerce: {
      youtube: [
        {
          title: "Build an eCommerce Website with HTML, CSS, JavaScript",
          url: "https://www.youtube.com/watch?v=3l8Lob4ysI0",
        },
        {
          title: "E-Commerce Website With Shopping Cart using JavaScript",
          url: "https://www.youtube.com/watch?v=18Jvyp60Vbg",
        },
        {
          title: "Build an E-commerce Site with Next.js and Stripe Checkout",
          url: "https://www.youtube.com/watch?v=_8M-YVY76O8",
        },
        {
          title: "Full Stack E-commerce Website from Scratch",
          url: "https://www.youtube.com/watch?v=ZGEODCpHBzk",
        },
        {
          title: "Shopify Tutorial For Beginners 2023",
          url: "https://www.youtube.com/watch?v=PTgmoZ2nMtg",
        },
      ],
      articles: [
        {
          title: "W3Schools - How To Create an E-commerce Site",
          url: "https://www.w3schools.com/howto/howto_website_create_store.asp",
        },
        {
          title: "MDN Web Docs - Web Payment API",
          url: "https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API",
        },
        {
          title: "Building an E-Commerce Site with Modern Web Technologies",
          url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Tutorial_local_library_website",
        },
      ],
      tutorials: [
        {
          title: "Complete E-Commerce Tutorial - FreeCodeCamp",
          url: "https://www.freecodecamp.org/news/how-to-build-an-e-commerce-website-with-html-css-and-javascript/",
        },
        {
          title: "E-Commerce Design Patterns - Smashing Magazine",
          url: "https://www.smashingmagazine.com/2022/01/modern-delivery-management-e-commerce-websites/",
        },
        {
          title: "Creating an E-Commerce Store with React - DigitalOcean",
          url: "https://www.digitalocean.com/community/tutorials/react-react-router-ecommerce",
        },
      ],
      repositories: [
        {
          title: "React Storefront - E-commerce PWA Starter",
          url: "https://github.com/elasticpath/react-pwa-reference-storefront",
        },
        {
          title: "CommerceJS & Next.js E-commerce",
          url: "https://github.com/chec/commercejs-nextjs-demo-store",
        },
      ],
      tools: [
        {
          title: "Shopify - E-commerce Platform",
          url: "https://www.shopify.com/",
        },
        {
          title: "WooCommerce - WordPress E-commerce",
          url: "https://woocommerce.com/",
        },
        {
          title: "Stripe - Payment Processing",
          url: "https://stripe.com/",
        },
      ],
    },
    portfolio: {
      youtube: [
        {
          title: "Build a Portfolio Website Tutorial for Beginners",
          url: "https://www.youtube.com/watch?v=_xkSvufmjEs",
        },
        {
          title: "Responsive Portfolio Website From Scratch",
          url: "https://www.youtube.com/watch?v=T7PnWnTgusc",
        },
        {
          title: "Build A Responsive Personal Portfolio Website",
          url: "https://www.youtube.com/watch?v=tcskp-ncN0I",
        },
        {
          title: "Build a Portfolio with React & Tailwind CSS",
          url: "https://www.youtube.com/watch?v=k-Pi5ZMxHWY",
        },
        {
          title: "Developer Portfolio Website Tutorial",
          url: "https://www.youtube.com/watch?v=0YFrGy_mzjY",
        },
      ],
      articles: [
        {
          title: "W3Schools - How To Create a Portfolio",
          url: "https://www.w3schools.com/howto/howto_website_create_portfolio.asp",
        },
        {
          title: "MDN Web Docs - CSS Grid Layout",
          url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout",
        },
        {
          title:
            "Building a Personal Portfolio Site with HTML, CSS, and JavaScript",
          url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web",
        },
      ],
      tutorials: [
        {
          title: "How to Build a Stunning Portfolio Website - FreeCodeCamp",
          url: "https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio-website/",
        },
        {
          title: "Portfolio Website Best Practices - Smashing Magazine",
          url: "https://www.smashingmagazine.com/2013/06/workflow-design-develop-modern-portfolio-website/",
        },
        {
          title: "Building a Portfolio That Stands Out - CSS-Tricks",
          url: "https://css-tricks.com/5-tips-for-your-developer-portfolio/",
        },
      ],
      repositories: [
        {
          title: "Dev Portfolio - Customizable Template",
          url: "https://github.com/RyanFitzgerald/devportfolio",
        },
        {
          title: "React Portfolio Template",
          url: "https://github.com/soumyajit4419/Portfolio",
        },
      ],
      tools: [
        {
          title: "GitHub Pages - Free Portfolio Hosting",
          url: "https://pages.github.com/",
        },
        {
          title: "Netlify - Website Deployment",
          url: "https://www.netlify.com/",
        },
        {
          title: "Figma - Design Tool",
          url: "https://www.figma.com/",
        },
      ],
    },
    blog: {
      youtube: [
        {
          title: "How To Create A Blog Website in HTML and CSS",
          url: "https://www.youtube.com/watch?v=Aj7HLsJenVg",
        },
        {
          title: "Create a Blog Website With HTML CSS JavaScript",
          url: "https://www.youtube.com/watch?v=Iwvf9iBP04M",
        },
        {
          title: "Build a Markdown Blog with React and Next.js",
          url: "https://www.youtube.com/watch?v=MrjeefD8sac",
        },
        {
          title: "Create a Blog with Next.js and Sanity CMS",
          url: "https://www.youtube.com/watch?v=I2dcpatq54o",
        },
        {
          title: "Gatsby Blog Tutorial for Beginners",
          url: "https://www.youtube.com/watch?v=JVlT3n49M2Q",
        },
      ],
      articles: [
        {
          title: "W3Schools - How To Create a Blog Layout",
          url: "https://www.w3schools.com/howto/howto_css_blog_layout.asp",
        },
        {
          title: "MDN Web Docs - HTML Sections and Outlines",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article",
        },
        {
          title: "Building a Blog with Modern Web Standards",
          url: "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps",
        },
      ],
      tutorials: [
        {
          title: "Building a Blog with Eleventy - CSS-Tricks",
          url: "https://css-tricks.com/a-complete-beginners-guide-to-11ty/",
        },
        {
          title: "Creating a Modern Blog - Smashing Magazine",
          url: "https://www.smashingmagazine.com/2022/02/creating-static-blog-11ty-vite/",
        },
        {
          title: "Static Site Generators for Blogs - FreeCodeCamp",
          url: "https://www.freecodecamp.org/news/how-to-build-a-blog-using-a-static-site-generator-and-strapi/",
        },
      ],
      repositories: [
        {
          title: "Next.js Blog Starter Template",
          url: "https://github.com/vercel/next.js/tree/canary/examples/blog-starter",
        },
        {
          title: "Gatsby Blog Starter",
          url: "https://github.com/gatsbyjs/gatsby-starter-blog",
        },
      ],
      tools: [
        {
          title: "WordPress - CMS for Blogs",
          url: "https://wordpress.org/",
        },
        {
          title: "Ghost - Modern Blog Platform",
          url: "https://ghost.org/",
        },
        {
          title: "Medium - Publishing Platform",
          url: "https://medium.com/",
        },
      ],
    },
    landing: {
      youtube: [
        {
          title: "Build a Landing Page Website with HTML and CSS",
          url: "https://www.youtube.com/watch?v=HZv8YHYUHTU",
        },
        {
          title: "How To Make A Landing Page Using HTML & CSS",
          url: "https://www.youtube.com/watch?v=MsRMgYrQV4s",
        },
        {
          title: "Create a Professional Landing Page with HTML CSS JavaScript",
          url: "https://www.youtube.com/watch?v=0J2aou7kzFo",
        },
        {
          title: "Responsive Landing Page using HTML, CSS, and JavaScript",
          url: "https://www.youtube.com/watch?v=lf8giXzuD7c",
        },
        {
          title: "Modern Landing Page with Animations and Effects",
          url: "https://www.youtube.com/watch?v=adUmUl79bi8",
        },
      ],
      articles: [
        {
          title: "W3Schools - How To Create a Landing Page",
          url: "https://www.w3schools.com/howto/howto_make_a_website.asp",
        },
        {
          title: "MDN Web Docs - Responsive Design",
          url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design",
        },
        {
          title: "Landing Page Best Practices",
          url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
        },
      ],
      tutorials: [
        {
          title: "Landing Page Optimization - Smashing Magazine",
          url: "https://www.smashingmagazine.com/2022/10/modern-fluid-typography-css-clamp/",
        },
        {
          title: "Building High-Converting Landing Pages - CSS-Tricks",
          url: "https://css-tricks.com/creating-an-editable-site-with-google-sheets-and-eleventy/",
        },
        {
          title: "Principles of Effective Landing Pages - FreeCodeCamp",
          url: "https://www.freecodecamp.org/news/how-to-build-a-landing-page-with-html-css-and-js/",
        },
      ],
      repositories: [
        {
          title: "Landing Page Templates Collection",
          url: "https://github.com/cruip/tailwind-landing-page-template",
        },
        {
          title: "Responsive Landing Page Templates",
          url: "https://github.com/tailwindtoolbox/Landing-Page",
        },
      ],
      tools: [
        {
          title: "Unbounce - Landing Page Builder",
          url: "https://unbounce.com/",
        },
        {
          title: "Leadpages - Landing Page Platform",
          url: "https://www.leadpages.com/",
        },
        {
          title: "Google Analytics - Conversion Tracking",
          url: "https://analytics.google.com/",
        },
      ],
    },
    dashboard: {
      youtube: [
        {
          title: "Build Admin Dashboard using HTML CSS JavaScript",
          url: "https://www.youtube.com/watch?v=FP7Hs8lTy1k",
        },
        {
          title: "Create Admin Dashboard with Chart.js",
          url: "https://www.youtube.com/watch?v=q3zea-rXH_M",
        },
        {
          title: "Build a Data Dashboard with JavaScript",
          url: "https://www.youtube.com/watch?v=l5zCl1cACKI",
        },
        {
          title: "Responsive Admin Dashboard Using HTML CSS & JavaScript",
          url: "https://www.youtube.com/watch?v=xWrF_wPk6ws",
        },
        {
          title: "React Admin Dashboard Tutorial From Scratch",
          url: "https://www.youtube.com/watch?v=jx5hdo50a2M",
        },
      ],
      articles: [
        {
          title: "W3Schools - How To Create a Dashboard",
          url: "https://www.w3schools.com/howto/howto_css_dashboard.asp",
        },
        {
          title: "MDN Web Docs - CSS Grid for Layouts",
          url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout",
        },
        {
          title: "Building Interactive Dashboards with JavaScript",
          url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial",
        },
      ],
      tutorials: [
        {
          title: "Building a Dashboard with D3.js - FreeCodeCamp",
          url: "https://www.freecodecamp.org/news/how-to-build-interactive-dashboards-with-d3/",
        },
        {
          title: "Admin Dashboard UX Best Practices - Smashing Magazine",
          url: "https://www.smashingmagazine.com/2023/09/designing-dashboards-complex-data/",
        },
        {
          title: "Creating Data Visualizations - CSS-Tricks",
          url: "https://css-tricks.com/how-to-make-a-responsive-dashboard-with-css-grid/",
        },
      ],
      repositories: [
        {
          title: "Admin Dashboard Template",
          url: "https://github.com/themesberg/volt-bootstrap-5-dashboard",
        },
        {
          title: "React Admin Dashboard",
          url: "https://github.com/adrianhajdin/project_syncfusion_dashboard",
        },
      ],
      tools: [
        {
          title: "Chart.js - JavaScript Charting",
          url: "https://www.chartjs.org/",
        },
        {
          title: "D3.js - Data Visualization",
          url: "https://d3js.org/",
        },
        {
          title: "Grafana - Analytics & Monitoring",
          url: "https://grafana.com/",
        },
      ],
    },
    responsive: {
      youtube: [
        {
          title: "Build a Responsive Website with HTML & CSS",
          url: "https://www.youtube.com/watch?v=p0bGHP-PXD4",
        },
        {
          title: "Responsive Web Design Tutorial For Beginners",
          url: "https://www.youtube.com/watch?v=srvUrASNj0s",
        },
        {
          title: "CSS Media Queries Tutorial For Responsive Design",
          url: "https://www.youtube.com/watch?v=2KL-z9A56SQ",
        },
        {
          title: "Mobile-First Responsive Build Tutorial",
          url: "https://www.youtube.com/watch?v=0ohtVzCSHqs",
        },
        {
          title: "Advanced Responsive Design Techniques",
          url: "https://www.youtube.com/watch?v=TUD1AWZVgQ8",
        },
      ],
      articles: [
        {
          title: "W3Schools - Responsive Web Design",
          url: "https://www.w3schools.com/css/css_rwd_intro.asp",
        },
        {
          title: "MDN Web Docs - Responsive Design",
          url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design",
        },
        {
          title: "Advanced Responsive Design Techniques",
          url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Media_queries",
        },
      ],
      tutorials: [
        {
          title: "A Complete Guide to Flexbox - CSS-Tricks",
          url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        },
        {
          title: "Responsive Design Patterns - Smashing Magazine",
          url: "https://www.smashingmagazine.com/2016/02/responsive-web-design-dynamic-adaptation-to-different-screen-sizes/",
        },
        {
          title: "Mobile-First Approach - FreeCodeCamp",
          url: "https://www.freecodecamp.org/news/taking-the-right-approach-to-responsive-web-design/",
        },
      ],
      repositories: [
        {
          title: "Responsive Templates Collection",
          url: "https://github.com/BlackrockDigital/startbootstrap",
        },
        {
          title: "Responsive Framework Boilerplate",
          url: "https://github.com/h5bp/html5-boilerplate",
        },
      ],
      tools: [
        {
          title: "Chrome DevTools - Device Mode",
          url: "https://developer.chrome.com/docs/devtools/device-mode/",
        },
        {
          title: "Responsively App - Responsive Testing",
          url: "https://responsively.app/",
        },
        {
          title: "Bootstrap - Responsive Framework",
          url: "https://getbootstrap.com/",
        },
      ],
    },
    default: {
      youtube: [
        {
          title: "HTML Tutorial for Beginners: HTML Crash Course",
          url: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
        },
        {
          title: "CSS Crash Course For Absolute Beginners",
          url: "https://www.youtube.com/watch?v=yfoY53QXEnI",
        },
        {
          title: "JavaScript Crash Course For Beginners",
          url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
        },
        {
          title: "Web Development Full Course - 10 Hours",
          url: "https://www.youtube.com/watch?v=Q33KBiDriJY",
        },
        {
          title: "Learn HTML5 and CSS3 From Scratch - Full Course",
          url: "https://www.youtube.com/watch?v=mU6anWqZJcc",
        },
        {
          title: "Full Stack Web Development Course 2023",
          url: "https://www.youtube.com/watch?v=nu_pCVPKzTk",
        },
        {
          title: "Git & GitHub Crash Course For Beginners",
          url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
        },
      ],
      articles: [
        {
          title: "W3Schools - HTML Tutorial",
          url: "https://www.w3schools.com/html/default.asp",
        },
        {
          title: "W3Schools - CSS Tutorial",
          url: "https://www.w3schools.com/css/default.asp",
        },
        {
          title: "W3Schools - JavaScript Tutorial",
          url: "https://www.w3schools.com/js/default.asp",
        },
        {
          title: "MDN Web Docs - Getting started with the web",
          url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web",
        },
        {
          title: "MDN Web Docs - HTML basics",
          url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics",
        },
        {
          title: "MDN Web Docs - CSS basics",
          url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics",
        },
      ],
      tutorials: [
        {
          title: "The Odin Project - Web Development 101",
          url: "https://www.theodinproject.com/",
        },
        {
          title: "Frontend Developer Roadmap - FreeCodeCamp",
          url: "https://www.freecodecamp.org/news/2019-web-developer-roadmap/",
        },
        {
          title: "Modern CSS Techniques - CSS-Tricks",
          url: "https://css-tricks.com/guides/",
        },
        {
          title: "Introduction to Web Development - Smashing Magazine",
          url: "https://www.smashingmagazine.com/2021/06/web-design-done-well-part1/",
        },
      ],
      repositories: [
        {
          title: "Awesome Web Development Resources",
          url: "https://github.com/markodenic/web-development-resources",
        },
        {
          title: "Frontend Mentor - Coding Challenges",
          url: "https://github.com/frontendmentorio",
        },
        {
          title: "33 JavaScript Concepts",
          url: "https://github.com/leonardomso/33-js-concepts",
        },
      ],
      tools: [
        {
          title: "Visual Studio Code - Code Editor",
          url: "https://code.visualstudio.com/",
        },
        {
          title: "CodePen - Online Code Editor",
          url: "https://codepen.io/",
        },
        {
          title: "GitHub - Version Control",
          url: "https://github.com/",
        },
        {
          title: "Can I Use - Browser Compatibility",
          url: "https://caniuse.com/",
        },
        {
          title: "Color Hunt - Color Palettes",
          url: "https://colorhunt.co/",
        },
      ],
    },
  };

  // Analyze prompt and code to determine project type
  const promptText = prompt?.toLowerCase() || "";
  const htmlText = code?.html?.toLowerCase() || "";
  const cssText = code?.css?.toLowerCase() || "";
  const jsText = code?.javascript?.toLowerCase() || "";

  // Check for ecommerce indicators
  if (
    promptText.includes("ecommerce") ||
    promptText.includes("e-commerce") ||
    promptText.includes("shop") ||
    promptText.includes("store") ||
    promptText.includes("product") ||
    htmlText.includes("cart") ||
    htmlText.includes("checkout") ||
    htmlText.includes("product") ||
    jsText.includes("cart") ||
    jsText.includes("checkout")
  ) {
    return resources.ecommerce;
  }

  // Check for portfolio indicators
  if (
    promptText.includes("portfolio") ||
    promptText.includes("resume") ||
    promptText.includes("cv") ||
    promptText.includes("personal website") ||
    htmlText.includes("portfolio") ||
    htmlText.includes("about me") ||
    htmlText.includes("my works") ||
    htmlText.includes("my projects")
  ) {
    return resources.portfolio;
  }

  // Check for blog indicators
  if (
    promptText.includes("blog") ||
    promptText.includes("article") ||
    promptText.includes("news") ||
    htmlText.includes("blog") ||
    htmlText.includes("article") ||
    htmlText.includes("post")
  ) {
    return resources.blog;
  }

  // Check for landing page indicators
  if (
    promptText.includes("landing") ||
    promptText.includes("splash") ||
    promptText.includes("home page") ||
    promptText.includes("main page") ||
    htmlText.includes("hero") ||
    cssText.includes("hero")
  ) {
    return resources.landing;
  }

  // Check for dashboard indicators
  if (
    promptText.includes("dashboard") ||
    promptText.includes("admin") ||
    promptText.includes("statistics") ||
    promptText.includes("analytics") ||
    htmlText.includes("dashboard") ||
    htmlText.includes("chart") ||
    jsText.includes("chart") ||
    jsText.includes("dashboard")
  ) {
    return resources.dashboard;
  }

  // Check for responsive design focus
  if (
    promptText.includes("responsive") ||
    promptText.includes("mobile") ||
    cssText.includes("@media") ||
    cssText.includes("responsive")
  ) {
    return resources.responsive;
  }

  // Default case
  return resources.default;
};

const ProjectDocumentation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isZipping, setIsZipping] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    name: "Untitled Project",
    prompt: "",
    code: { html: "", css: "", javascript: "" },
    roadmap: [],
    explanation: "",
    resources: { youtube: YOUTUBE_LINKS, articles: [] },
  });

  useEffect(() => {
    if (location.state) {
      const { projectName, initialPrompt, code } = location.state;
      const resourceLinks = getResourceLinks(initialPrompt, code);

      setProjectDetails({
        name: projectName || "Untitled Project",
        prompt: generateProjectDescription(initialPrompt, code),
        code: code || { html: "", css: "", javascript: "" },
        roadmap: generateRoadmap(initialPrompt, code),
        explanation: generateExplanation(code, initialPrompt),
        resources: resourceLinks,
      });
    }
  }, [location.state]);

  const generateRoadmap = (prompt, code) => {
    // Generate roadmap based on project complexity and requirements
    let roadmapSteps = [];

    // Analyze the prompt to determine project complexity
    const isComplex =
      prompt?.length > 200 ||
      (code?.javascript && code.javascript.length > 500);
    const hasInteractivity =
      code?.javascript && code.javascript.includes("addEventListener");
    const hasForms =
      code?.html &&
      (code.html.includes("<form") || code.html.includes("<input"));
    const hasAPI =
      code?.javascript &&
      (code.javascript.includes("fetch(") || code.javascript.includes("axios"));
    const hasResponsive =
      code?.css &&
      (code.css.includes("@media") ||
        code.css.includes("flex") ||
        code.css.includes("grid"));

    // Analyze code for framework usage
    const usesReact =
      code?.javascript &&
      (code.javascript.includes("React") ||
        code.javascript.includes("useState"));
    const usesVue = code?.javascript && code.javascript.includes("Vue");
    const usesAngular = code?.javascript && code.javascript.includes("Angular");
    const usesTailwind =
      code?.css &&
      code.javascript &&
      (code.css.includes("tailwind") ||
        (code.html.includes('class="') &&
          code.html.includes("text-") &&
          code.html.includes("bg-")));
    const usesBootstrap =
      code?.css &&
      (code.css.includes("bootstrap") ||
        (code.html.includes('class="') &&
          code.html.includes("container") &&
          code.html.includes("row")));

    // Framework and libraries details
    const frameworks = [];
    if (usesReact) frameworks.push("React");
    if (usesVue) frameworks.push("Vue");
    if (usesAngular) frameworks.push("Angular");
    if (usesTailwind) frameworks.push("Tailwind CSS");
    if (usesBootstrap) frameworks.push("Bootstrap");
    const frameworkText =
      frameworks.length > 0
        ? `The project uses ${frameworks.join(
            ", "
          )} which requires specific setup.`
        : "The project uses vanilla JavaScript, HTML, and CSS.";

    // Base setup phase - more detailed and educational
    roadmapSteps.push({
      title: "Project Setup",
      steps: [
        `Create project file structure (organizing HTML, CSS, and JavaScript files ${
          usesReact || usesVue || usesAngular
            ? "using appropriate component architecture"
            : "in a logical manner"
        })`,
        `Initialize version control system (e.g., Git) to track changes and enable collaboration`,
        `Set up development environment with necessary dependencies${
          frameworks.length > 0 ? " (" + frameworks.join(", ") + ")" : ""
        }`,
        "Configure build tools and development server for efficient development workflow",
        "Set up linting and formatting tools to maintain code quality",
      ],
      explanation: `This initial phase establishes the foundation for your project. ${frameworkText} Proper project setup ensures consistent development practices and makes future maintenance easier. Version control is essential for tracking changes and collaborating with others.`,
    });

    // Design phase - more detailed and realistic
    const designSteps = [
      "Define user personas and user journey maps to understand the target audience",
      "Create wireframes to outline the structure of key pages/screens",
      "Design mockups with detailed visual elements and spacing",
    ];

    if (hasResponsive) {
      designSteps.push(
        "Design responsive layouts for different screen sizes (mobile, tablet, desktop) with specific breakpoints"
      );
      designSteps.push(
        "Create responsive design specifications including typography scaling and element reflow"
      );
    }

    designSteps.push(
      "Define comprehensive color scheme, typography hierarchy, and visual elements with specific measurements"
    );

    if (isComplex) {
      designSteps.push(
        "Create component library and design system with documentation for consistent UI"
      );
      designSteps.push(
        "Define interaction states for all interactive elements (hover, active, focus, disabled)"
      );
    }

    roadmapSteps.push({
      title: "Design Phase",
      steps: designSteps,
      explanation: `The design phase translates requirements into visual concepts. ${
        hasResponsive
          ? "Your code uses responsive design techniques, so creating layouts for different screen sizes is essential."
          : ""
      } This phase should result in clear visual guidelines that developers can follow to ensure consistent implementation.`,
    });

    // Development phase - more specific to the actual code
    const devSteps = [];

    // HTML implementation details
    if (
      code?.html &&
      code.html.includes("<header") &&
      code.html.includes("<footer")
    ) {
      devSteps.push(
        "Implement HTML structure with semantic tags (header, nav, main, footer) to improve accessibility and SEO"
      );
    } else {
      devSteps.push(
        "Implement HTML structure based on design, using semantic tags where appropriate"
      );
    }

    // CSS implementation details
    if (hasResponsive) {
      if (usesTailwind) {
        devSteps.push(
          "Apply Tailwind CSS utility classes for responsive design, ensuring proper responsive behavior at breakpoints"
        );
      } else if (usesBootstrap) {
        devSteps.push(
          "Implement Bootstrap grid system and responsive utilities to ensure cross-device compatibility"
        );
      } else {
        devSteps.push(
          "Implement responsive CSS with media queries for mobile-first or desktop-first approach"
        );
      }
    } else {
      devSteps.push(
        "Apply CSS styling and layout based on design specifications"
      );
    }

    // JavaScript implementation details
    if (hasInteractivity) {
      if (usesReact) {
        devSteps.push(
          "Create React components and implement interactive functionality using hooks (useState, useEffect)"
        );
      } else if (usesVue) {
        devSteps.push(
          "Develop Vue components and implement interactive features using Vue's reactivity system"
        );
      } else {
        devSteps.push(
          "Implement core interactive functionality using event listeners and DOM manipulation"
        );
      }
    }

    if (hasForms) {
      devSteps.push(
        "Create form validation logic with appropriate error handling and user feedback"
      );
      devSteps.push(
        "Implement data handling for form submission and response processing"
      );
    }

    if (hasAPI) {
      devSteps.push(
        "Integrate with backend APIs using proper error handling and loading states"
      );
      devSteps.push(
        "Implement data caching and state management for API responses"
      );
    }

    devSteps.push(
      "Optimize assets and resources for performance (image compression, code minification)"
    );

    if (code?.javascript && code.javascript.length > 300) {
      devSteps.push(
        "Refactor code to improve readability, maintainability, and performance"
      );
    }

    roadmapSteps.push({
      title: "Development Phase",
      steps: devSteps,
      explanation: `During development, you'll translate designs into functional code. ${
        hasInteractivity
          ? "Your project contains interactive elements requiring JavaScript event handling."
          : ""
      } ${
        hasForms
          ? "Form implementation requires careful validation and error handling."
          : ""
      } ${
        hasAPI
          ? "API integration needs proper error and loading state management."
          : ""
      } Following best practices during this phase will result in more maintainable and performant code.`,
    });

    // Testing and deployment - more comprehensive
    const testingSteps = [
      "Perform code reviews to identify potential issues and improve code quality",
      "Conduct manual testing across different browsers (Chrome, Firefox, Safari, Edge)",
      "Test on various devices and screen sizes to verify responsive behavior",
    ];

    if (hasForms || hasInteractivity) {
      testingSteps.push(
        "Conduct usability testing with representative users to gather feedback"
      );
      testingSteps.push(
        "Implement automated testing for critical user interactions and form submissions"
      );
    }

    testingSteps.push(
      "Audit and optimize performance using browser developer tools and Lighthouse",
      "Perform accessibility testing to ensure WCAG compliance",
      "Set up continuous integration/deployment pipeline",
      "Configure production environment with appropriate caching and security headers",
      "Deploy to production environment with monitoring in place"
    );

    if (isComplex) {
      testingSteps.push(
        "Implement analytics to track user behavior and site performance"
      );
      testingSteps.push(
        "Establish monitoring for errors and performance issues in production"
      );
    }

    roadmapSteps.push({
      title: "Testing & Deployment",
      steps: testingSteps,
      explanation: `Testing ensures your application works as expected across different environments. ${
        hasInteractivity
          ? "With interactive features, thorough testing is essential to catch edge cases."
          : ""
      } Deployment preparation includes optimizing for production and setting up the infrastructure. After deployment, monitoring will help you identify and address issues quickly.`,
    });

    // Maintenance and iteration phase - new phase
    const maintenanceSteps = [
      "Gather user feedback and analytics data to identify improvement areas",
      "Prioritize and implement feature enhancements based on user needs",
      "Address bugs and issues as they arise",
      "Perform regular code and dependency updates to maintain security",
      "Document code changes and maintain technical documentation",
    ];

    roadmapSteps.push({
      title: "Maintenance & Iteration",
      steps: maintenanceSteps,
      explanation: `Software development doesn't end with deployment. Regular maintenance ensures your application remains secure and functional. User feedback provides valuable insights for future iterations. This continuous improvement process helps your application evolve to better meet user needs over time.`,
    });

    return roadmapSteps;
  };

  // Additional function to analyze the project at a higher level for the description
  const generateProjectDescription = (prompt, code) => {
    if (!prompt || prompt.trim() === "") {
      return "This project was generated based on a prompt. The documentation provides a detailed explanation of the code structure, functionality, and development approach to help you understand how it works.";
    }

    // Analyze code to determine project type and features
    const features = [];

    if (code?.html && code.html.includes("<form")) {
      features.push("user input forms");
    }

    if (code?.javascript && code.javascript.includes("addEventListener")) {
      features.push("interactive elements");
    }

    if (
      code?.javascript &&
      (code.javascript.includes("fetch(") || code.javascript.includes("axios"))
    ) {
      features.push("data fetching from external sources");
    }

    if (code?.css && code.css.includes("@media")) {
      features.push("responsive design for different screen sizes");
    }

    if (
      code?.css &&
      (code.css.includes("animation") || code.css.includes("transition"))
    ) {
      features.push("animations and transitions");
    }

    // Determine framework usage
    let frameworkInfo = "";
    if (code?.javascript && code.javascript.includes("React")) {
      frameworkInfo =
        "It is built using React, a popular JavaScript library for building user interfaces.";
    } else if (code?.javascript && code.javascript.includes("Vue")) {
      frameworkInfo =
        "It is built using Vue.js, a progressive JavaScript framework for building user interfaces.";
    } else if (code?.javascript && code.javascript.includes("Angular")) {
      frameworkInfo =
        "It is built using Angular, a platform and framework for building single-page client applications.";
    } else {
      frameworkInfo =
        "It is built using vanilla HTML, CSS, and JavaScript without relying on major frameworks.";
    }

    // Generate comprehensive description
    const featureText =
      features.length > 0
        ? `The implementation includes ${features.join(", ")}.`
        : "The implementation focuses on providing a clean, functional user interface.";

    const description = `This project aims to ${prompt}. ${frameworkInfo} ${featureText}

This documentation is designed to help you understand the code structure and functionality, especially if you're working with AI-generated code. Each section provides insights into how different aspects of the code work together, the reasoning behind implementation choices, and guidance for future development.

Understanding the code structure will help you:
• Make informed modifications to the functionality
• Debug issues more effectively
• Extend the project with new features
• Ensure proper maintenance and updates

The roadmap section provides a realistic development plan that you can follow if you're implementing this project from scratch or continuing its development.`;

    return description;
  };

  const analyzeHTML = (html) => {
    if (!html) {
      return {
        summary: "No HTML code available for analysis.",
        details: [],
      };
    }

    const features = {
      summary:
        "The HTML implements a structured document with semantic markup.",
      details: [],
    };

    if (html.includes("<header")) {
      features.details.push("Uses semantic header element for page header");
    }

    if (html.includes("<nav")) {
      features.details.push(
        "Includes navigation section with semantic nav element"
      );
    }

    if (html.includes("<main")) {
      features.details.push(
        "Implements main content area with semantic main element"
      );
    }

    if (html.includes("<section")) {
      features.details.push("Organizes content into logical sections");
    }

    if (html.includes("<article")) {
      features.details.push(
        "Contains article elements for self-contained content"
      );
    }

    if (html.includes("<aside")) {
      features.details.push("Includes aside element for complementary content");
    }

    if (html.includes("<footer")) {
      features.details.push("Uses semantic footer element");
    }

    if (html.includes("<form")) {
      features.details.push("Implements form for user input");
    }

    if (html.includes("class=")) {
      features.details.push(
        "Uses class attributes for styling and JavaScript selection"
      );
    }

    if (html.includes("id=")) {
      features.details.push(
        "Implements ID attributes for unique element identification"
      );
    }

    if (html.includes("data-")) {
      features.details.push("Uses data attributes for custom data storage");
    }

    if (features.details.length === 0) {
      features.details.push("Basic HTML structure with standard elements");
    }

    return features;
  };

  const analyzeCSS = (css) => {
    if (!css) {
      return {
        summary: "No CSS code available for analysis.",
        details: [],
      };
    }

    const features = {
      summary:
        "The CSS implements styling with a focus on visual presentation and layout.",
      details: [],
    };

    if (css.includes("@media")) {
      features.summary =
        "The CSS implements responsive design with media queries for different screen sizes.";
      features.details.push("Uses media queries for responsive layouts");
    }

    if (css.includes("display: flex") || css.includes("display:flex")) {
      features.details.push("Implements flexbox for flexible layouts");
    }

    if (css.includes("display: grid") || css.includes("display:grid")) {
      features.details.push("Uses CSS grid for two-dimensional layouts");
    }

    if (css.includes("animation") || css.includes("@keyframes")) {
      features.details.push(
        "Includes CSS animations for dynamic visual effects"
      );
    }

    if (css.includes("transition")) {
      features.details.push("Uses transitions for smooth state changes");
    }

    if (css.includes("var(--")) {
      features.details.push("Implements CSS variables for consistent theming");
    }

    if (css.includes(":hover") || css.includes(":focus")) {
      features.details.push("Includes interactive states for elements");
    }

    const colorCount = (css.match(/#[0-9a-f]{3,6}|rgb\(|rgba\(/gi) || [])
      .length;
    if (colorCount > 5) {
      features.details.push(
        `Uses a palette of approximately ${colorCount} colors`
      );
    }

    if (features.details.length === 0) {
      features.details.push("Basic CSS styling for layout and appearance");
    }

    return features;
  };

  const analyzeJS = (js) => {
    if (!js) {
      return {
        summary: "No JavaScript code available for analysis.",
        details: [],
      };
    }

    const features = {
      summary:
        "The JavaScript adds interactivity and dynamic behavior to the page.",
      details: [],
    };

    if (js.includes("addEventListener")) {
      features.details.push("Implements event listeners for user interaction");
    }

    if (js.includes("querySelector") || js.includes("getElementById")) {
      features.details.push(
        "Uses DOM selection methods to manipulate page elements"
      );
    }

    if (js.includes("createElement")) {
      features.details.push("Dynamically creates DOM elements");
    }

    if (js.includes("fetch(") || js.includes("XMLHttpRequest")) {
      features.details.push("Makes asynchronous HTTP requests for data");
    }

    if (js.includes("localStorage") || js.includes("sessionStorage")) {
      features.details.push("Uses browser storage for data persistence");
    }

    if (js.includes("function")) {
      const functionCount =
        (js.match(/function\s+\w+\s*\(/g) || []).length +
        (js.match(/const\s+\w+\s*=\s*function/g) || []).length +
        (js.match(/const\s+\w+\s*=\s*\(/g) || []).length;
      if (functionCount > 0) {
        features.details.push(
          `Contains approximately ${functionCount} functions for modular code organization`
        );
      }
    }

    if (js.includes("class ")) {
      features.details.push("Uses classes for object-oriented programming");
    }

    if (js.includes("async ") || js.includes("await ")) {
      features.details.push(
        "Implements async/await for asynchronous operations"
      );
    }

    if (
      js.includes(".map(") ||
      js.includes(".filter(") ||
      js.includes(".reduce(")
    ) {
      features.details.push("Uses array methods for data transformation");
    }

    if (features.details.length === 0) {
      features.details.push("Basic JavaScript functionality for interactivity");
    }

    return features;
  };

  const determineProjectFocus = (html, css, js) => {
    // Determine the primary focus of the project based on code analysis
    const hasRichHTML = html.details.length > 3;
    const hasRichCSS = css.details.length > 3;
    const hasRichJS = js.details.length > 3;

    if (hasRichHTML && hasRichCSS && hasRichJS) {
      return "comprehensive user experience, visual design, and interactive functionality";
    } else if (hasRichHTML && hasRichCSS) {
      return "content structure and visual presentation";
    } else if (hasRichHTML && hasRichJS) {
      return "content structure and interactive functionality";
    } else if (hasRichCSS && hasRichJS) {
      return "visual design and interactive functionality";
    } else if (hasRichHTML) {
      return "content structure and semantic markup";
    } else if (hasRichCSS) {
      return "visual design and presentation";
    } else if (hasRichJS) {
      return "interactive functionality and dynamic behavior";
    } else {
      return "essential web development principles";
    }
  };

  const generateTechnicalDecisions = (html, css, js) => {
    const decisions = [];

    if (html.details.some((d) => d.includes("semantic"))) {
      decisions.push(
        "Semantic HTML was chosen to improve accessibility and SEO"
      );
    }

    if (
      css.details.some(
        (d) => d.includes("responsive") || d.includes("media queries")
      )
    ) {
      decisions.push(
        "Responsive design approach ensures compatibility across devices"
      );
    }

    if (css.details.some((d) => d.includes("flexbox") || d.includes("grid"))) {
      decisions.push(
        "Modern CSS layout techniques provide flexible and robust positioning"
      );
    }

    if (js.details.some((d) => d.includes("async"))) {
      decisions.push(
        "Asynchronous programming patterns improve user experience during data operations"
      );
    }

    if (js.details.some((d) => d.includes("modular"))) {
      decisions.push(
        "Modular code organization enhances maintainability and reusability"
      );
    }

    if (decisions.length === 0) {
      return "The implementation uses standard web technologies to achieve the desired functionality.";
    }

    return decisions.join(". ") + ".";
  };

  const generateEnhancements = (html, css, js) => {
    const enhancements = [];

    if (
      !html.details.some(
        (d) => d.includes("accessibility") || d.includes("aria")
      )
    ) {
      enhancements.push(
        "Enhance accessibility with ARIA attributes and keyboard navigation"
      );
    }

    if (
      !css.details.some((d) => d.includes("responsive") || d.includes("media"))
    ) {
      enhancements.push(
        "Implement responsive design for better mobile experience"
      );
    }

    if (
      !css.details.some(
        (d) => d.includes("animation") || d.includes("transition")
      )
    ) {
      enhancements.push("Add subtle animations to improve user experience");
    }

    if (!js.details.some((d) => d.includes("storage"))) {
      enhancements.push(
        "Implement local storage for persistent user preferences"
      );
    }

    if (
      !js.details.some((d) => d.includes("asynchronous") || d.includes("fetch"))
    ) {
      enhancements.push("Add data fetching capabilities for dynamic content");
    }

    if (enhancements.length === 0) {
      return "The project already implements comprehensive features. Future enhancements could focus on performance optimization and expanded functionality.";
    }

    return (
      "Potential future enhancements could include:\n- " +
      enhancements.join("\n- ")
    );
  };

  const generateExplanation = (code, prompt) => {
    if (!code || (!code.html && !code.css && !code.javascript)) {
      return "No code available to explain.";
    }

    // Analyze code to extract insights
    const htmlFeatures = analyzeHTML(code.html);
    const cssFeatures = analyzeCSS(code.css);
    const jsFeatures = analyzeJS(code.javascript);

    // Generate comprehensive explanation
    return `# Project Overview
${
  prompt
    ? `This project aims to ${prompt.substring(0, 100)}${
        prompt.length > 100 ? "..." : ""
      }.`
    : "This project implements a web interface with the following features:"
}

## HTML Structure
${htmlFeatures.summary}

${htmlFeatures.details.map((detail) => `- ${detail}`).join("\n")}

## CSS Implementation
${cssFeatures.summary}

${cssFeatures.details.map((detail) => `- ${detail}`).join("\n")}

## JavaScript Functionality
${jsFeatures.summary}

${jsFeatures.details.map((detail) => `- ${detail}`).join("\n")}

## Implementation Approach
The implementation follows modern web development best practices, with a focus on ${determineProjectFocus(
      htmlFeatures,
      cssFeatures,
      jsFeatures
    )}. 

The code is structured to be maintainable and scalable, with clear separation of concerns between structure (HTML), presentation (CSS), and behavior (JavaScript).

## Technical Decisions
${generateTechnicalDecisions(htmlFeatures, cssFeatures, jsFeatures)}

## Development Roadmap
${projectDetails.roadmap
  .map(
    (phase) => `
### ${phase.title}
${phase.steps.map((step) => `- ${step}`).join("\n")}
`
  )
  .join("\n")}

## Potential Enhancements
${generateEnhancements(htmlFeatures, cssFeatures, jsFeatures)}`;
  };

  const exportToZip = async () => {
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const projectName = projectDetails.name.replace(/\s+/g, "_");

      // Add code files to zip
      if (projectDetails.code.html) {
        zip.file("index.html", projectDetails.code.html);
      }

      if (projectDetails.code.css) {
        zip.file("styles.css", projectDetails.code.css);
      }

      if (projectDetails.code.javascript) {
        zip.file("script.js", projectDetails.code.javascript);
      }

      // Analyze code to generate dynamic explanation
      const htmlFeatures = analyzeHTML(projectDetails.code.html);
      const cssFeatures = analyzeCSS(projectDetails.code.css);
      const jsFeatures = analyzeJS(projectDetails.code.javascript);

      // Format enhancements as bullet points
      let enhancementsText = generateEnhancements(
        htmlFeatures,
        cssFeatures,
        jsFeatures
      );
      if (
        enhancementsText.includes("Potential future enhancements could include")
      ) {
        enhancementsText = enhancementsText.replace(
          "Potential future enhancements could include:\n- ",
          ""
        );
        enhancementsText = enhancementsText
          .split("\n- ")
          .map((item) => `- ${item}`)
          .join("\n");
      }

      // Create README.md with project explanation
      const readmeContent = `# ${projectDetails.name}

## Project Description
${projectDetails.prompt}

## Project Structure
- \`index.html\`: Main HTML structure for the project
- \`styles.css\`: CSS styling for the project
- \`script.js\`: JavaScript functionality for the project

## HTML Structure
${htmlFeatures.summary}

${htmlFeatures.details.map((detail) => `- ${detail}`).join("\n")}

## CSS Implementation
${cssFeatures.summary}

${cssFeatures.details.map((detail) => `- ${detail}`).join("\n")}

## JavaScript Functionality
${jsFeatures.summary}

${jsFeatures.details.map((detail) => `- ${detail}`).join("\n")}

## Implementation Approach
The implementation follows modern web development best practices, with a focus on ${determineProjectFocus(
        htmlFeatures,
        cssFeatures,
        jsFeatures
      )}. 

The code is structured to be maintainable and scalable, with clear separation of concerns between structure (HTML), presentation (CSS), and behavior (JavaScript).

## Technical Decisions
${generateTechnicalDecisions(htmlFeatures, cssFeatures, jsFeatures)}

## Development Roadmap
${projectDetails.roadmap
  .map(
    (phase) => `
### ${phase.title}
${phase.steps.map((step) => `- ${step}`).join("\n")}
`
  )
  .join("\n")}

## Potential Enhancements
${enhancementsText}

## Learning Resources

### YouTube Tutorials
${projectDetails.resources.youtube
  .map((link) => `- [${link.title}](${link.url})`)
  .join("\n")}

### Documentation & Articles
${projectDetails.resources.articles
  .map((link) => `- [${link.title}](${link.url})`)
  .join("\n")}

${
  projectDetails.resources.tutorials
    ? `
### Step-by-Step Tutorials
${projectDetails.resources.tutorials
  .map((link) => `- [${link.title}](${link.url})`)
  .join("\n")}
`
    : ""
}

${
  projectDetails.resources.repositories
    ? `
### GitHub Repositories
${projectDetails.resources.repositories
  .map((link) => `- [${link.title}](${link.url})`)
  .join("\n")}
`
    : ""
}

${
  projectDetails.resources.tools
    ? `
### Helpful Tools
${projectDetails.resources.tools
  .map((link) => `- [${link.title}](${link.url})`)
  .join("\n")}
`
    : ""
}

## Generated on
${new Date().toLocaleDateString()}
`;

      zip.file("README.md", readmeContent);

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${projectName}.zip`);

      // Show success message
      setTimeout(() => {
        alert(
          `Project files and documentation have been exported successfully as ${projectName}.zip`
        );
      }, 500);
    } catch (error) {
      console.error("Error generating ZIP:", error);
      alert("There was an error generating the ZIP file. Please try again.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto" id="project-documentation">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Project Documentation
            </h1>
          </div>
          <button
            onClick={exportToZip}
            disabled={isZipping}
            className={`flex items-center px-4 py-2 rounded-md ${
              isZipping
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            } transition-colors`}
          >
            <Archive className="w-5 h-5 mr-2" />
            {isZipping ? "Creating ZIP..." : "Export Project"}
          </button>
        </div>

        <div className="mb-6 text-sm text-gray-500 bg-gray-100 rounded-md p-3">
          <p>
            <strong>Project Export:</strong> Click the 'Export Project' button
            to download a ZIP file containing your project files (HTML, CSS, JS)
            and a detailed README with documentation.
          </p>
        </div>

        {/* Project Header */}
        <div id="doc-header" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {projectDetails.name}
          </h2>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <FileText className="w-4 h-4 mr-2" />
            <span>
              Documentation generated on {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Project Description */}
        <div
          id="doc-description"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Project Description</h3>
          <p className="text-gray-700 whitespace-pre-line">
            {projectDetails.prompt}
          </p>
        </div>

        {/* Project Roadmap */}
        <div
          id="doc-roadmap"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Development Roadmap</h3>
          <p className="text-gray-700 mb-6">
            This roadmap provides a structured approach to implementing this
            project, breaking down the process into manageable phases. Each
            phase focuses on specific aspects of development, with realistic
            steps based on the project's complexity and requirements.
          </p>
          <div className="space-y-8">
            {projectDetails.roadmap.map((phase, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold mb-2">{phase.title}</h4>
                {phase.explanation && (
                  <p className="text-gray-700 mb-3 italic">
                    {phase.explanation}
                  </p>
                )}
                <ul className="list-disc pl-5 space-y-2">
                  {phase.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-gray-700">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="text-md font-semibold text-blue-800 mb-2">
              Understanding the Development Process
            </h4>
            <p className="text-gray-700">
              This roadmap is tailored to the specific features detected in your
              code. Following these steps will help you understand not just what
              to build, but how the pieces fit together. Even if you're working
              with AI-generated code, this breakdown helps clarify the
              development process and gives you a realistic timeline for
              implementation.
            </p>
          </div>
        </div>

        {/* Code Implementation */}
        <div id="doc-code" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Code Implementation</h3>

          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">HTML</h4>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="markup"
                style={atomDark}
                showLineNumbers
              >
                {projectDetails.code.html || "<!-- No HTML code available -->"}
              </SyntaxHighlighter>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">CSS</h4>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="css"
                style={atomDark}
                showLineNumbers
              >
                {projectDetails.code.css || "/* No CSS code available */"}
              </SyntaxHighlighter>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-2">JavaScript</h4>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="javascript"
                style={atomDark}
                showLineNumbers
              >
                {projectDetails.code.javascript ||
                  "// No JavaScript code available"}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        {/* Code Explanation */}
        <div
          id="doc-explanation"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Code Explanation</h3>

          {/* Project Overview Section */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">Project Overview</h4>
            <p className="text-gray-700">
              {projectDetails.prompt
                ? `This project aims to ${projectDetails.prompt.substring(
                    0,
                    100
                  )}${projectDetails.prompt.length > 100 ? "..." : ""}.`
                : "This project implements a web interface with the following features:"}
            </p>
          </div>

          {/* HTML Structure Section */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">HTML Structure</h4>
            <p className="text-gray-700 mb-2">
              {analyzeHTML(projectDetails.code.html).summary}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {analyzeHTML(projectDetails.code.html).details.map(
                (detail, index) => (
                  <li key={index} className="text-gray-700">
                    {detail}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* CSS Implementation Section */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">CSS Implementation</h4>
            <p className="text-gray-700 mb-2">
              {analyzeCSS(projectDetails.code.css).summary}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {analyzeCSS(projectDetails.code.css).details.map(
                (detail, index) => (
                  <li key={index} className="text-gray-700">
                    {detail}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* JavaScript Functionality Section */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">
              JavaScript Functionality
            </h4>
            <p className="text-gray-700 mb-2">
              {analyzeJS(projectDetails.code.javascript).summary}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {analyzeJS(projectDetails.code.javascript).details.map(
                (detail, index) => (
                  <li key={index} className="text-gray-700">
                    {detail}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Implementation Approach Section */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">
              Implementation Approach
            </h4>
            <p className="text-gray-700">
              The implementation follows modern web development best practices,
              with a focus on{" "}
              {determineProjectFocus(
                analyzeHTML(projectDetails.code.html),
                analyzeCSS(projectDetails.code.css),
                analyzeJS(projectDetails.code.javascript)
              )}
              .
            </p>
            <p className="text-gray-700 mt-2">
              The code is structured to be maintainable and scalable, with clear
              separation of concerns between structure (HTML), presentation
              (CSS), and behavior (JavaScript).
            </p>
          </div>

          {/* Technical Decisions Section */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">Technical Decisions</h4>
            <p className="text-gray-700">
              {generateTechnicalDecisions(
                analyzeHTML(projectDetails.code.html),
                analyzeCSS(projectDetails.code.css),
                analyzeJS(projectDetails.code.javascript)
              )}
            </p>
          </div>

          {/* Potential Enhancements Section */}
          <div>
            <h4 className="text-lg font-medium mb-2">Potential Enhancements</h4>
            <div className="text-gray-700 whitespace-pre-line">
              {generateEnhancements(
                analyzeHTML(projectDetails.code.html),
                analyzeCSS(projectDetails.code.css),
                analyzeJS(projectDetails.code.javascript)
              ).includes("Potential future enhancements could include") ? (
                <div>
                  <p>Potential future enhancements could include:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    {generateEnhancements(
                      analyzeHTML(projectDetails.code.html),
                      analyzeCSS(projectDetails.code.css),
                      analyzeJS(projectDetails.code.javascript)
                    )
                      .replace(
                        "Potential future enhancements could include:\n- ",
                        ""
                      )
                      .split("\n- ")
                      .map((enhancement, index) => (
                        <li key={index} className="text-gray-700">
                          {enhancement}
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <p>
                  {generateEnhancements(
                    analyzeHTML(projectDetails.code.html),
                    analyzeCSS(projectDetails.code.css),
                    analyzeJS(projectDetails.code.javascript)
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div
          id="doc-resources"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
          <p className="text-gray-700 mb-4">
            These resources are specifically selected based on your project type
            and features to help you understand and extend your implementation.
          </p>

          {/* YouTube Videos */}
          {projectDetails.resources.youtube &&
            projectDetails.resources.youtube.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-2">YouTube Tutorials</h4>
                <p className="text-gray-700 mb-3">
                  Video tutorials to guide you through similar projects and
                  techniques.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectDetails.resources.youtube.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Youtube className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
                      <span className="text-blue-600">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          {/* Documentation & Articles */}
          {projectDetails.resources.articles &&
            projectDetails.resources.articles.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-2">
                  Documentation & Articles
                </h4>
                <p className="text-gray-700 mb-3">
                  Official documentation and helpful articles to deepen your
                  understanding.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectDetails.resources.articles.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <FileText className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span className="text-blue-600">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          {/* Tutorials */}
          {projectDetails.resources.tutorials &&
            projectDetails.resources.tutorials.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-2">
                  Step-by-Step Tutorials
                </h4>
                <p className="text-gray-700 mb-3">
                  Detailed guides from top web development resources.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectDetails.resources.tutorials.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 mr-2 text-green-600 flex-shrink-0"
                      >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        <path d="m9 9.5 4 3-4 3"></path>
                      </svg>
                      <span className="text-blue-600">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          {/* GitHub Repositories */}
          {projectDetails.resources.repositories &&
            projectDetails.resources.repositories.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-2">
                  GitHub Repositories
                </h4>
                <p className="text-gray-700 mb-3">
                  Code repositories and templates you can reference or fork.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectDetails.resources.repositories.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 mr-2 text-purple-600 flex-shrink-0"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                        <path d="M9 18c-4.51 2-5-2-7-2"></path>
                      </svg>
                      <span className="text-blue-600">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          {/* Helpful Tools */}
          {projectDetails.resources.tools &&
            projectDetails.resources.tools.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-2">Helpful Tools</h4>
                <p className="text-gray-700 mb-3">
                  Tools and services to enhance your development workflow.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectDetails.resources.tools.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 mr-2 text-orange-600 flex-shrink-0"
                      >
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                      <span className="text-blue-600">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentation;
