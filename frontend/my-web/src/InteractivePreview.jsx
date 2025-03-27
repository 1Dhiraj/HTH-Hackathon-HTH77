import React, { useState, useEffect, useRef } from 'react';
import {
  Pencil, Eye, Type, Image, Square,
  AlignLeft, AlignCenter, AlignRight,
  ArrowUpToLine, ArrowDownToLine,
  Trash2, Code, Undo, Redo, Bold,
  Italic, Underline, Copy, RotateCcw
} from 'lucide-react';

// Color Picker Component (assumed)
import ColorPicker from './ColorPicker';

// Context Menu Component (assumed)
import ContextMenu from './ContextMenu';
// UI Code Generator Component (assumed)
import UICodeGenerator from './UICodeGenerator';

// Main Interactive Preview Component
const InteractivePreview = ({ htmlContent, onGenerateCode = () => {} }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [error, setError] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const iframeRef = useRef(null);
  const iframeLoaded = useRef(false);

  const getIframeScript = () => `
    let selectedElement = null;
    let isResizing = false;
    let isDragging = false;
    let isRotating = false;
    let dragStart = { x: 0, y: 0 };
    let rotateStartAngle = 0;
    let isEditMode = ${isEditMode};

    function makeElementEditable(element) {
      if (!element || element.classList.contains('resize-handle') || element.classList.contains('rotate-handle')) return;

      element.classList.add('editable');

      if (!element.dataset.originalStyles) {
        const computedStyle = window.getComputedStyle(element);
        element.dataset.originalStyles = JSON.stringify({
          position: computedStyle.position || 'absolute',
          left: computedStyle.left || '0px',
          top: computedStyle.top || '0px',
          textAlign: computedStyle.textAlign || 'left',
          padding: computedStyle.padding || '0px',
          marginTop: computedStyle.marginTop || '0px',
          marginRight: computedStyle.marginRight || '0px',
          marginBottom: computedStyle.marginBottom || '0px',
          marginLeft: computedStyle.marginLeft || '0px',
          width: computedStyle.width || 'auto',
          height: computedStyle.height || 'auto',
          borderColor: computedStyle.borderColor || 'transparent',
          borderWidth: computedStyle.borderWidth || '0px',
          borderStyle: computedStyle.borderStyle || 'none',
          fontSize: computedStyle.fontSize || '16px',
          fontFamily: computedStyle.fontFamily || 'Arial, sans-serif',
          fontWeight: computedStyle.fontWeight || 'normal',
          fontStyle: computedStyle.fontStyle || 'normal',
          textDecoration: computedStyle.textDecoration || 'none',
          transform: computedStyle.transform || 'none',
          opacity: computedStyle.opacity || '1'
        });
      }

      element.addEventListener('dblclick', (e) => {
        if (!isEditMode || element.tagName === 'IMG') return;
        element.contentEditable = true;
        element.focus();
        const originalStyles = JSON.parse(element.dataset.originalStyles);
        applyOriginalStyles(element, originalStyles);
      });

      element.addEventListener('click', (e) => {
        if (!isEditMode) return;
        e.stopPropagation();

        const prevSelected = document.querySelector('.selected');
        if (prevSelected) {
          prevSelected.classList.remove('selected');
          removeResizeHandles(prevSelected);
          prevSelected.contentEditable = false;
        }

        element.classList.add('selected');
        selectedElement = element;
        addResizeHandles(element);
        addRotateHandle(element);

        const originalStyles = JSON.parse(element.dataset.originalStyles);
        window.parent.postMessage({
          type: 'elementSelected',
          element: {
            tagName: element.tagName,
            width: element.offsetWidth,
            height: element.offsetHeight,
            textAlign: element.style.textAlign || originalStyles.textAlign,
            zIndex: element.style.zIndex || '0',
            padding: element.style.padding || originalStyles.padding,
            marginTop: element.style.marginTop || originalStyles.marginTop,
            marginRight: element.style.marginRight || originalStyles.marginRight,
            marginBottom: element.style.marginBottom || originalStyles.marginBottom,
            marginLeft: element.style.marginLeft || originalStyles.marginLeft,
            position: originalStyles.position,
            left: originalStyles.left !== 'auto' ? originalStyles.left : '0px',
            top: originalStyles.top !== 'auto' ? originalStyles.top : '0px',
            borderColor: element.style.borderColor || originalStyles.borderColor,
            borderWidth: element.style.borderWidth || originalStyles.borderWidth,
            borderStyle: element.style.borderStyle || originalStyles.borderStyle,
            fontSize: element.style.fontSize || originalStyles.fontSize,
            fontFamily: element.style.fontFamily || originalStyles.fontFamily,
            fontWeight: element.style.fontWeight || originalStyles.fontWeight,
            fontStyle: element.style.fontStyle || originalStyles.fontStyle,
            textDecoration: element.style.textDecoration || originalStyles.textDecoration,
            transform: element.style.transform || originalStyles.transform,
            opacity: element.style.opacity || originalStyles.opacity
          }
        }, '*');
      });

      element.addEventListener('mousedown', (e) => {
        if (!isEditMode || e.target.classList.contains('resize-handle') || 
            e.target.classList.contains('rotate-handle') || element.contentEditable === 'true') return;

        isDragging = true;
        const rect = element.getBoundingClientRect();
        const originalStyles = JSON.parse(element.dataset.originalStyles);

        dragStart = {
          x: e.clientX - (parseFloat(originalStyles.left) || rect.left),
          y: e.clientY - (parseFloat(originalStyles.top) || rect.top)
        };

        if (!originalStyles.position || originalStyles.position === 'static') {
          element.style.position = 'absolute';
        }
        e.preventDefault();
      });
    }

    function applyOriginalStyles(element, styles) {
      element.style.position = styles.position;
      element.style.left = styles.left;
      element.style.top = styles.top;
      element.style.textAlign = styles.textAlign;
      element.style.padding = styles.padding;
      element.style.marginTop = styles.marginTop;
      element.style.marginRight = styles.marginRight;
      element.style.marginBottom = styles.marginBottom;
      element.style.marginLeft = styles.marginLeft;
      element.style.width = styles.width;
      element.style.height = styles.height;
      element.style.borderColor = styles.borderColor;
      element.style.borderWidth = styles.borderWidth;
      element.style.borderStyle = styles.borderStyle;
      element.style.fontSize = styles.fontSize;
      element.style.fontFamily = styles.fontFamily;
      element.style.fontWeight = styles.fontWeight;
      element.style.fontStyle = styles.fontStyle;
      element.style.textDecoration = styles.textDecoration;
      element.style.transform = styles.transform;
      element.style.opacity = styles.opacity;
    }

    function removeResizeHandles(element) {
      if (!element) return;
      const handles = element.querySelectorAll('.resize-handle, .rotate-handle');
      handles.forEach(handle => handle.remove());
    }

    function addResizeHandles(element) {
      if (!element) return;
      removeResizeHandles(element);

      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

      positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = \`resize-handle \${pos}\`;

        handle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          isResizing = true;
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = element.offsetWidth;
          const startHeight = element.offsetHeight;
          const startLeft = parseFloat(element.style.left) || 0;
          const startTop = parseFloat(element.style.top) || 0;

          const handleMouseMove = (moveEvent) => {
            if (!isResizing) return;
            
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (pos.includes('right')) {
              element.style.width = \`\${Math.max(20, startWidth + deltaX)}px\`;
            }
            if (pos.includes('bottom')) {
              element.style.height = \`\${Math.max(20, startHeight + deltaY)}px\`;
            }
            if (pos.includes('left')) {
              element.style.width = \`\${Math.max(20, startWidth - deltaX)}px\`;
              element.style.left = \`\${startLeft + deltaX}px\`;
            }
            if (pos.includes('top')) {
              element.style.height = \`\${Math.max(20, startHeight - deltaY)}px\`;
              element.style.top = \`\${startTop + deltaY}px\`;
            }

            window.parent.postMessage({
              type: 'elementResized',
              element: {
                tagName: element.tagName,
                width: element.offsetWidth,
                height: element.offsetHeight,
                left: element.style.left,
                top: element.style.top
              }
            }, '*');
          };

          const handleMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            createHistorySnapshot();
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        });

        element.appendChild(handle);
      });
    }

    function addRotateHandle(element) {
      const rotateHandle = document.createElement('div');
      rotateHandle.className = 'rotate-handle';
      rotateHandle.style.position = 'absolute';
      rotateHandle.style.top = '-20px';
      rotateHandle.style.left = '50%';
      rotateHandle.style.transform = 'translateX(-50%)';
      rotateHandle.style.width = '12px';
      rotateHandle.style.height = '12px';
      rotateHandle.style.background = '#2563EB';
      rotateHandle.style.borderRadius = '50%';
      rotateHandle.style.cursor = 'grab';

      rotateHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isRotating = true;
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        rotateStartAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

        const handleRotateMove = (moveEvent) => {
          if (!isRotating) return;
          const newAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
          const rotation = newAngle - rotateStartAngle;
          element.style.transform = \`rotate(\${rotation}deg)\`;
          
          const originalStyles = JSON.parse(element.dataset.originalStyles);
          originalStyles.transform = element.style.transform;
          element.dataset.originalStyles = JSON.stringify(originalStyles);
        };

        const handleRotateUp = () => {
          isRotating = false;
          document.removeEventListener('mousemove', handleRotateMove);
          document.removeEventListener('mouseup', handleRotateUp);
          createHistorySnapshot();
        };

        document.addEventListener('mousemove', handleRotateMove);
        document.addEventListener('mouseup', handleRotateUp);
      });

      element.appendChild(rotateHandle);
    }

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !selectedElement) return;

      const originalStyles = JSON.parse(selectedElement.dataset.originalStyles);
      const x = e.clientX - dragStart.x;
      const y = e.clientY - dragStart.y;

      selectedElement.style.left = \`\${x}px\`;
      selectedElement.style.top = \`\${y}px\`;
      if (!originalStyles.position || originalStyles.position === 'static') {
        selectedElement.style.position = 'absolute';
      }

      originalStyles.left = selectedElement.style.left;
      originalStyles.top = selectedElement.style.top;
      originalStyles.position = selectedElement.style.position;
      selectedElement.dataset.originalStyles = JSON.stringify(originalStyles);

      window.parent.postMessage({
        type: 'elementResized',
        element: {
          tagName: selectedElement.tagName,
          width: selectedElement.offsetWidth,
          height: selectedElement.offsetHeight,
          left: selectedElement.style.left,
          top: selectedElement.style.top
        }
      }, '*');
    });

    document.addEventListener('mouseup', (e) => {
      if (selectedElement) {
        selectedElement.classList.remove('dragging');
        if (isDragging) {
          createHistorySnapshot();
        }
      }
      isDragging = false;
    });

    document.body.addEventListener('click', (e) => {
      if (e.target === document.body) {
        const prevSelected = document.querySelector('.selected');
        if (prevSelected) {
          prevSelected.classList.remove('selected');
          removeResizeHandles(prevSelected);
          prevSelected.contentEditable = false;
        }
        selectedElement = null;
        window.parent.postMessage({ type: 'clearSelection' }, '*');
      }
    });

    document.body.addEventListener('contextmenu', (e) => {
      if (!isEditMode) return;
      e.preventDefault();
      
      const element = e.target.closest('.editable');
      if (!element) return;

      const prevSelected = document.querySelector('.selected');
      if (prevSelected && prevSelected !== element) {
        prevSelected.classList.remove('selected');
        removeResizeHandles(prevSelected);
        prevSelected.contentEditable = false;
      }

      element.classList.add('selected');
      selectedElement = element;
      addResizeHandles(element);
      addRotateHandle(element);

      const originalStyles = JSON.parse(element.dataset.originalStyles);
      window.parent.postMessage({
        type: 'showContextMenu',
        x: e.clientX,
        y: e.clientY,
        element: {
          tagName: element.tagName,
          width: element.offsetWidth,
          height: element.offsetHeight,
          textAlign: element.style.textAlign || originalStyles.textAlign,
          zIndex: element.style.zIndex || '0',
          padding: element.style.padding || originalStyles.padding,
          marginTop: element.style.marginTop || originalStyles.marginTop,
          marginRight: element.style.marginRight || originalStyles.marginRight,
          marginBottom: element.style.marginBottom || originalStyles.marginBottom,
          marginLeft: element.style.marginLeft || originalStyles.marginLeft,
          position: originalStyles.position,
          left: originalStyles.left !== 'auto' ? originalStyles.left : '0px',
          top: originalStyles.top !== 'auto' ? originalStyles.top : '0px',
          borderColor: element.style.borderColor || originalStyles.borderColor,
          borderWidth: element.style.borderWidth || originalStyles.borderWidth,
          borderStyle: element.style.borderStyle || originalStyles.borderStyle,
          fontSize: element.style.fontSize || originalStyles.fontSize,
          fontFamily: element.style.fontFamily || originalStyles.fontFamily,
          fontWeight: element.style.fontWeight || originalStyles.fontWeight,
          fontStyle: element.style.fontStyle || originalStyles.fontStyle,
          textDecoration: element.style.textDecoration || originalStyles.textDecoration,
          transform: element.style.transform || originalStyles.transform,
          opacity: element.style.opacity || originalStyles.opacity
        }
      }, '*');
    });

    function createHistorySnapshot() {
      const bodyClone = document.body.cloneNode(true);
      const script = bodyClone.querySelector('script[data-editor-script]');
      if (script) script.remove();
      
      bodyClone.querySelectorAll('.resize-handle, .rotate-handle').forEach(el => el.remove());
      
      bodyClone.querySelectorAll('.editable, .selected').forEach(el => {
        el.classList.remove('editable', 'selected', 'dragging');
        el.removeAttribute('contenteditable');
      });

      const snapshot = bodyClone.innerHTML;
      window.parent.postMessage({
        type: 'historySnapshot',
        snapshot: snapshot
      }, '*');
    }

    function applyHistoryState(htmlContent) {
      const selectedId = selectedElement ? selectedElement.id || null : null;
      
      document.body.innerHTML = htmlContent;
      
      const elements = document.querySelectorAll('body *');
      elements.forEach(element => {
        if (isEditMode) {
          makeElementEditable(element);
        }
      });
      
      if (selectedId) {
        const elementToSelect = document.getElementById(selectedId);
        if (elementToSelect) {
          elementToSelect.click();
        }
      }
      
      if (!document.querySelector('.selected')) {
        selectedElement = null;
        window.parent.postMessage({ type: 'clearSelection' }, '*');
      }
    }

    function initializeEditMode() {
      if (isEditMode) {
        const elements = document.querySelectorAll('body *');
        elements.forEach(element => {
          makeElementEditable(element);
        });
        setTimeout(createHistorySnapshot, 300);
      }
    }

    window.parent.postMessage({ type: 'iframeReady' }, '*');

    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) return;

      const { type, data } = event.data;

      switch (type) {
        case 'toggleEditMode':
          isEditMode = data.isEditMode;
          const elements = document.querySelectorAll('body *');
          elements.forEach(element => {
            if (isEditMode) {
              makeElementEditable(element);
            } else {
              element.classList.remove('editable', 'selected');
              element.contentEditable = false;
              removeResizeHandles(element);
              const originalStyles = element.dataset.originalStyles ? JSON.parse(element.dataset.originalStyles) : {};
              applyOriginalStyles(element, originalStyles);
            }
          });
          
          if (isEditMode) {
            createHistorySnapshot();
          }
          break;

        case 'addElement':
          const newElement = document.createElement(data.elementType === 'text' ? 'div' : data.elementType);

          let initialStyles = {
            position: 'absolute',
            left: '50%',
            top: '50%',
            margin: '0',
            padding: '0px',
            marginTop: '0px',
            marginRight: '0px',
            marginBottom: '0px',
            marginLeft: '0px',
            borderColor: 'transparent',
            borderWidth: '0px',
            borderStyle: 'none',
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            transform: 'none',
            opacity: '1'
          };

          switch(data.elementType) {
            case 'text':
              newElement.textContent = 'Double click to edit text';
              newElement.style.minWidth = '100px';
              initialStyles.width = 'auto';
              initialStyles.height = 'auto';
              initialStyles.textAlign = 'left';
              break;
            case 'div':
              newElement.style.width = '100px';
              newElement.style.height = '100px';
              newElement.style.backgroundColor = '#E5E7EB';
              initialStyles.width = '100px';
              initialStyles.height = '100px';
              break;
            case 'img':
              newElement.src = '/api/placeholder/200/200';
              newElement.alt = 'New image';
              newElement.style.maxWidth = '200px';
              initialStyles.width = '200px';
              initialStyles.height = 'auto';
              break;
          }

          Object.assign(newElement.style, {
            position: initialStyles.position,
            left: initialStyles.left,
            top: initialStyles.top,
            transform: 'translate(-50%, -50%)',
            margin: initialStyles.margin,
            padding: initialStyles.padding,
            fontSize: initialStyles.fontSize,
            fontFamily: initialStyles.fontFamily,
            opacity: initialStyles.opacity
          });

          newElement.dataset.originalStyles = JSON.stringify(initialStyles);

          document.body.appendChild(newElement);
          makeElementEditable(newElement);
          newElement.click();
          createHistorySnapshot();
          break;

        case 'alignElement':
          if (selectedElement) {
            selectedElement.style.textAlign = data.align;
            const originalStyles = JSON.parse(selectedElement.dataset.originalStyles);
            originalStyles.textAlign = data.align;
            selectedElement.dataset.originalStyles = JSON.stringify(originalStyles);
            createHistorySnapshot();
          }
          break;

        case 'adjustZIndex':
          if (selectedElement) {
            const currentZ = parseInt(selectedElement.style.zIndex || 0);
            selectedElement.style.zIndex = data.toFrontOrBack ? 
              (data.toFrontOrBack === 'front' ? 1000 : -1000) : 
              (currentZ + data.change).toString();
            createHistorySnapshot();
          }
          break;

        case 'deleteElement':
          if (selectedElement) {
            selectedElement.remove();
            selectedElement = null;
            window.parent.postMessage({ type: 'clearSelection' }, '*');
            createHistorySnapshot();
          }
          break;

        case 'duplicateElement':
          if (selectedElement) {
            const clone = selectedElement.cloneNode(true);
            const originalStyles = JSON.parse(selectedElement.dataset.originalStyles);
            clone.style.left = \`\${parseFloat(originalStyles.left) + 20}px\`;
            clone.style.top = \`\${parseFloat(originalStyles.top) + 20}px\`;
            originalStyles.left = clone.style.left;
            originalStyles.top = clone.style.top;
            clone.dataset.originalStyles = JSON.stringify(originalStyles);
            document.body.appendChild(clone);
            makeElementEditable(clone);
            clone.click();
            createHistorySnapshot();
          }
          break;

        case 'updateColor':
          if (selectedElement) {
            selectedElement.style[data.property] = data.color;
            if (data.property === 'borderColor') {
              selectedElement.style.borderWidth = selectedElement.style.borderWidth || '1px';
              selectedElement.style.borderStyle = selectedElement.style.borderStyle || 'solid';
            }
            
            const originalStyles = JSON.parse(selectedElement.dataset.originalStyles || '{}');
            originalStyles[data.property] = selectedElement.style[data.property];
            selectedElement.dataset.originalStyles = JSON.stringify(originalStyles);
            
            createHistorySnapshot();
          }
          break;

        case 'updateStyle':
          if (selectedElement) {
            if (data.property === 'padding') {
              if (typeof data.value === 'object') {
                selectedElement.style.padding = \`\${data.value.top}px \${data.value.right}px \${data.value.bottom}px \${data.value.left}px\`;
              } else {
                selectedElement.style.padding = data.value;
              }
            }
            else if (data.property === 'margin') {
              if (typeof data.value === 'object') {
                selectedElement.style.margin = \`\${data.value.top}px \${data.value.right}px \${data.value.bottom}px \${data.value.left}px\`;
              } else {
                selectedElement.style.margin = data.value;
              }
            }
            else if (['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].includes(data.property)) {
              selectedElement.style[data.property] = typeof data.value === 'string' ? data.value : \`\${data.value}px\`;
            }
            else {
              selectedElement.style[data.property] = data.value;
            }

            const originalStyles = JSON.parse(selectedElement.dataset.originalStyles || '{}');
            originalStyles[data.property] = selectedElement.style[data.property];
            selectedElement.dataset.originalStyles = JSON.stringify(originalStyles);
            
            if (!selectedElement.style.position) {
              selectedElement.style.position = originalStyles.position || 'absolute';
            }
            
            createHistorySnapshot();
            
            window.parent.postMessage({
              type: 'elementUpdated',
              element: {
                tagName: selectedElement.tagName,
                width: selectedElement.offsetWidth,
                height: selectedElement.offsetHeight,
                textAlign: selectedElement.style.textAlign || originalStyles.textAlign,
                padding: selectedElement.style.padding || originalStyles.padding,
                marginTop: selectedElement.style.marginTop || originalStyles.marginTop,
                marginRight: selectedElement.style.marginRight || originalStyles.marginRight,
                marginBottom: selectedElement.style.marginBottom || originalStyles.marginBottom,
                marginLeft: selectedElement.style.marginLeft || originalStyles.marginLeft,
                position: selectedElement.style.position || originalStyles.position,
                left: selectedElement.style.left || originalStyles.left,
                top: selectedElement.style.top || originalStyles.top,
                borderColor: selectedElement.style.borderColor || originalStyles.borderColor,
                borderWidth: selectedElement.style.borderWidth || originalStyles.borderWidth,
                borderStyle: selectedElement.style.borderStyle || originalStyles.borderStyle,
                fontSize: selectedElement.style.fontSize || originalStyles.fontSize,
                fontFamily: selectedElement.style.fontFamily || originalStyles.fontFamily,
                fontWeight: selectedElement.style.fontWeight || originalStyles.fontWeight,
                fontStyle: selectedElement.style.fontStyle || originalStyles.fontStyle,
                textDecoration: selectedElement.style.textDecoration || originalStyles.textDecoration,
                transform: selectedElement.style.transform || originalStyles.transform,
                opacity: selectedElement.style.opacity || originalStyles.opacity
              }
            }, '*');
          }
          break;

        case 'getContent':
          const bodyClone = document.body.cloneNode(true);
          const script = bodyClone.querySelector('script[data-editor-script]');
          if (script) script.remove();
          
          bodyClone.querySelectorAll('.editable, .selected, .resize-handle, .rotate-handle').forEach(el => {
            el.classList.remove('editable', 'selected', 'dragging');
            el.removeAttribute('contenteditable');
            el.removeAttribute('data-original-styles');
          });

          const cleanedHtml = bodyClone.innerHTML;
          const styles = document.querySelector('style')?.innerHTML || '';

          window.parent.postMessage({
            type: 'contentResponse',
            content: {
              html: cleanedHtml,
              css: styles,
              javascript: '',
              combined: \`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>\${styles}</style>
  </head>
  <body>
    \${cleanedHtml}
  </body>
</html>\`
            }
          }, '*');
          break;

        case 'applyHistoryState':
          applyHistoryState(data.htmlContent);
          break;
          
        case 'checkEditMode':
          window.parent.postMessage({
            type: 'editModeStatus',
            isEditMode: isEditMode
          }, '*');
          break;
      }
    });

    window.addEventListener('load', () => {
      initializeEditMode();
    });
  `;

  useEffect(() => {
    setHistory([]);
    setCurrentHistoryIndex(-1);
    iframeLoaded.current = false;
  }, [htmlContent]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { 
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              position: relative;
              font-family: Arial, sans-serif;
            }
            .editable {
              position: relative;
              outline: 1px dashed #ccc;
              min-height: 20px;
              min-width: 20px;
            }
            .editable:hover {
              outline: 2px dashed #60A5FA;
            }
            .selected {
              outline: 2px solid #2563EB !important;
            }
            .resize-handle {
              position: absolute;
              width: 8px;
              height: 8px;
              background: #2563EB;
              border: 1px solid white;
              border-radius: 50%;
              z-index: 1000;
            }
            .resize-handle.top-left { top: -4px; left: -4px; cursor: nw-resize; }
            .resize-handle.top-right { top: -4px; right: -4px; cursor: ne-resize; }
            .resize-handle.bottom-left { bottom: -4px; left: -4px; cursor: sw-resize; }
            .resize-handle.bottom-right { bottom: -4px; right: -4px; cursor: se-resize; }
            .rotate-handle {
              position: absolute;
              width: 12px;
              height: 12px;
              background: #2563EB;
              border-radius: 50%;
              z-index: 1000;
              cursor: grab;
            }
            .dragging {
              opacity: 0.8;
              cursor: move !important;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
        <script data-editor-script>
          ${getIframeScript()}
        </script>
      </html>
    `;
  }, [htmlContent]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event) => {
      if (event.source !== iframe.contentWindow) return;

      switch (event.data.type) {
        case 'iframeReady':
          iframeLoaded.current = true;
          iframe.contentWindow.postMessage({
            type: 'toggleEditMode',
            data: { isEditMode }
          }, '*');
          break;
        case 'elementSelected':
          setSelectedElement(event.data.element);
          break;
        case 'elementResized':
          setSelectedElement(event.data.element);
          break;
        case 'elementUpdated':
          setSelectedElement(event.data.element);
          break;
        case 'clearSelection':
          setSelectedElement(null);
          break;
        case 'showContextMenu':
          setSelectedElement(event.data.element);
          setContextMenu({ x: event.data.x, y: event.data.y });
          break;
        case 'contentResponse':
          onGenerateCode(event.data.content);
          break;
        case 'historySnapshot':
          setHistory(prevHistory => {
            const newHistory = prevHistory.slice(0, currentHistoryIndex + 1);
            return [...newHistory, event.data.snapshot];
          });
          setCurrentHistoryIndex(prevIndex => prevIndex + 1);
          break;
        case 'editModeStatus':
          if (event.data.isEditMode !== isEditMode) {
            iframe.contentWindow.postMessage({
              type: 'toggleEditMode',
              data: { isEditMode }
            }, '*');
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEditMode, onGenerateCode, currentHistoryIndex]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow && iframeLoaded.current) {
      iframe.contentWindow.postMessage({
        type: 'toggleEditMode',
        data: { isEditMode }
      }, '*');
    }
  }, [isEditMode]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    
    const checkEditMode = () => {
      if (iframe && iframe.contentWindow && iframeLoaded.current) {
        iframe.contentWindow.postMessage({ type: 'checkEditMode' }, '*');
      }
    };

    const intervalId = setInterval(checkEditMode, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAddElement = (type) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'addElement',
      data: { elementType: type }
    }, '*');
  };

  const handleAlignElement = (align) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'alignElement',
      data: { align }
    }, '*');
  };

  const handleZIndexChange = (change, toFrontOrBack = null) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'adjustZIndex',
      data: { change, toFrontOrBack }
    }, '*');
  };

  const handleDeleteElement = () => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'deleteElement'
    }, '*');
  };

  const handleDuplicateElement = () => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'duplicateElement'
    }, '*');
  };

  const handleColorChange = (property, color) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'updateColor',
      data: { property, color }
    }, '*');
  };

  const handlePropertyChange = (property, value) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'updateStyle',
      data: { 
        property, 
        value: typeof value === 'number' ? `${value}px` : value 
      }
    }, '*');
  };

  const handleGenerateCode = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'getContent' }, '*');
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      iframeRef.current?.contentWindow?.postMessage({
        type: 'applyHistoryState',
        data: { htmlContent: history[newIndex] }
      }, '*');
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      iframeRef.current?.contentWindow?.postMessage({
        type: 'applyHistoryState',
        data: { htmlContent: history[newIndex] }
      }, '*');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b flex-wrap gap-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              isEditMode ? "bg-red-500 text-white hover:bg-red-600" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isEditMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          </button>

          {isEditMode && (
            <>
              <div className="flex space-x-2 border-r pr-2">
                <button
                  onClick={() => handleAddElement('text')}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Add Text"
                >
                  <Type className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAddElement('div')}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Add Shape"
                >
                  <Square className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAddElement('img')}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Add Image"
                >
                  <Image className="w-5 h-5" />
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={currentHistoryIndex <= 0}
                  className={`p-2 rounded ${currentHistoryIndex > 0 ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
                  title="Undo"
                >
                  <Undo className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={currentHistoryIndex >= history.length - 1}
                  className={`p-2 rounded ${currentHistoryIndex < history.length - 1 ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
                  title="Redo"
                >
                  <Redo className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {isEditMode && selectedElement && (
          <div className="flex space-x-2 items-center flex-wrap gap-2">
            {/* Alignment */}
            <button
              onClick={() => handleAlignElement('left')}
              className="p-2 rounded hover:bg-gray-200"
              title="Align Left"
            >
              <AlignLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleAlignElement('center')}
              className="p-2 rounded hover:bg-gray-200"
              title="Align Center"
            >
              <AlignCenter className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleAlignElement('right')}
              className="p-2 rounded hover:bg-gray-200"
              title="Align Right"
            >
              <AlignRight className="w-5 h-5" />
            </button>

            {/* Layer Management */}
            <button
              onClick={() => handleZIndexChange(1)}
              className="p-2 rounded hover:bg-gray-200"
              title="Bring Forward"
            >
              <ArrowUpToLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZIndexChange(-1)}
              className="p-2 rounded hover:bg-gray-200"
              title="Send Backward"
            >
              <ArrowDownToLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZIndexChange(0, 'front')}
              className="p-2 rounded hover:bg-gray-200"
              title="Bring to Front"
            >
              <ArrowUpToLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZIndexChange(0, 'back')}
              className="p-2 rounded hover:bg-gray-200"
              title="Send to Back"
            >
              <ArrowDownToLine className="w-5 h-5" />
            </button>

            {/* Text Formatting */}
            {selectedElement.tagName === 'DIV' && selectedElement.textContent && (
              <>
                <button
                  onClick={() => handlePropertyChange('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Bold"
                >
                  <Bold className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePropertyChange('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Italic"
                >
                  <Italic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePropertyChange('textDecoration', selectedElement.textDecoration === 'underline' ? 'none' : 'underline')}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Underline"
                >
                  <Underline className="w-5 h-5" />
                </button>
                <select
                  onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
                  value={selectedElement.fontSize || '16px'}
                  className="p-2 rounded border"
                >
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                    <option key={size} value={`${size}px`}>{size}px</option>
                  ))}
                </select>
                <select
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                  value={selectedElement.fontFamily || 'Arial, sans-serif'}
                  className="p-2 rounded border"
                >
                  {['Arial, sans-serif', 'Helvetica, sans-serif', 'Times New Roman, serif', 'Georgia, serif', 'Courier New, monospace'].map(family => (
                    <option key={family} value={family}>{family.split(',')[0]}</option>
                  ))}
                </select>
              </>
            )}

            {/* Opacity */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedElement.opacity || 1}
              onChange={(e) => handlePropertyChange('opacity', e.target.value)}
              className="w-20"
              title="Opacity"
            />

            {/* Duplicate and Delete */}
            <button
              onClick={handleDuplicateElement}
              className="p-2 rounded hover:bg-gray-200"
              title="Duplicate"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteElement}
              className="p-2 rounded hover:bg-gray-200"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <ColorPicker onColorChange={handleColorChange} />
          </div>
        )}

        {isEditMode && (
          <UICodeGenerator onGenerateCode={handleGenerateCode} />
        )}
      </div>

      <div className="relative flex-1 overflow-auto bg-gray-50 p-4">
        <iframe
          ref={iframeRef}
          title="Interactive Preview"
          className="w-full h-full bg-white shadow-lg"
          sandbox="allow-scripts allow-same-origin"
        />
        {contextMenu && isEditMode && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onPropertyChange={handlePropertyChange}
          />
        )}
      </div>

      {selectedElement && isEditMode && (
        <div className="p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Selected: {selectedElement.tagName.toLowerCase()}
            </span>
            <div className="text-sm">
              {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)} px
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 border-t">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default InteractivePreview;