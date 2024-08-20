export const DEFAULT_HEIGHT = '487.5px';
export const DEFAULT_WIDTH = 450;
export const MIN_WIDTH = 375;

export function updateIframeStyle(iframe: HTMLIFrameElement, style: { width: number }) {
    updateIframeWidth(iframe, style.width);
}

export const getStyleElementIdentifier = function() {
    const uniqId = Date.now().toString();
    return function() {
        return {
            id: uniqId,
            defaultClassName: `default-widget-iframe-${uniqId}`,
            specifiedClassName: `specified-widget-iframe-${uniqId}`,
        };
    };
}();


function updateStyleTagInnerHTML(styleElement: HTMLStyleElement, { defaultClassName, specifiedClassName, width }: {
    defaultClassName: string,
    specifiedClassName: string,
    width: number
}) {
    styleElement.innerHTML = '';
    styleElement.innerHTML = `
        .${defaultClassName} {
            width: ${DEFAULT_WIDTH}px;
            min-height: ${DEFAULT_HEIGHT};
        }
        @media (max-width: 767px) {
            .${defaultClassName} {
                width: 100%;
            }
        }
        .${specifiedClassName} {
            width: ${width}px;
            min-height: ${DEFAULT_HEIGHT};
        }
    `;
}

function importWidthHeightStyle(width: number) {
    const { id, defaultClassName, specifiedClassName } = getStyleElementIdentifier();

    const existStyleElement = document.getElementById(id);
    if (existStyleElement) {
        updateStyleTagInnerHTML(existStyleElement as HTMLStyleElement, { defaultClassName, specifiedClassName, width });
        return existStyleElement;
    }
    const styleElement = document.createElement('style');
    updateStyleTagInnerHTML(styleElement, { defaultClassName, specifiedClassName, width });
    styleElement.id = id;
    document.head.appendChild(styleElement);
    return styleElement;
}

function updateIframeWidth(iframe: HTMLIFrameElement, width?: number) {
    const newWidth = Number(width);
    const { defaultClassName, specifiedClassName } = getStyleElementIdentifier();
    if (width === undefined) {
        importWidthHeightStyle(DEFAULT_WIDTH);
        iframe.className = defaultClassName;
    } else {
        importWidthHeightStyle(newWidth < MIN_WIDTH ? MIN_WIDTH : newWidth);
        iframe.className = specifiedClassName;
    }
}

export function destroyStyleElement() {
    const { id } = getStyleElementIdentifier();
    const styleElement = document.getElementById(id);
    if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
    }
}