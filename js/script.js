function ts() {
    return new Date().toISOString();
}

// Function to highlight all parent elements recursively
function highlightHierarchy(currentElement, targetElement) {
    if (currentElement === document.body) return; // Base case: stop if there's no more parent
    if (currentElement === targetElement) {
        currentElement.style.outline = '4px dotted rgb(254, 156, 36)'; // Highlight current level
    } else {
        currentElement.style.outline = '2px dashed rgb(175, 172, 172)'; // Highlight other levels
    }
    highlightHierarchy(currentElement.parentElement, targetElement); // Highlight parent element
}

// Function to remove highlight from all elements recursively
function removeHighlight(element) {
    if (element === document.body) return; // Base case: stop if there's no more parent
    element.style.outline = 'none'; // Remove highlight from current element
    removeHighlight(element.parentElement); // Remove highlight from parent element
}


function getBodyRelativeXY(event) {
    const bodyRect = document.body.getBoundingClientRect();
    return {
        x: event.clientX - bodyRect.left,
        y: event.clientY - bodyRect.top
    };
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('HierarClick ready');

    let isManualContextMenu = false;
    let isRightClicking = false; // Flag to track right mouse button state
    let clickedElement = null; // Store the element initially clicked
    let currentElement = null; // Store the current level element
    let circles = null;



    let initialY = 0; // Initial Y coordinate of mouse click
    let initialX = 0; // Initial X coordinate of mouse click
    const circleRadius = 5; // Radius of the circles representing hierarchy levels
    const circleSpacing = 20; // Spacing between circles

    const contextMenu = document.getElementById('context-menu');

    // Show the custom context menu at the specified position
    function showContextMenu(x, y) {
        console.log('Showing context menu at ', x, y, ts());

        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.style.display = 'flex';
    }

    function setContextMenuTagName(element) {
        contextMenu.getElementsByClassName('tag-name')[0].innerText = element.tagName.toLowerCase();
    }

    // Hide the custom context menu
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    function triggerContextMenu(element, clientX, clientY) {
        const event = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: clientX,
            clientY: clientY
        });

        setTimeout(() => {
            isManualContextMenu = true;
            showContextMenu(clientX, clientY)
            setContextMenuTagName(element);
        }, 100);
    }


    // Event listener to hide the context menu when clicking outside of it
    document.addEventListener('click', (event) => {
        if (event.target !== contextMenu && !contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });

    // Event listener to hide the context menu when pressing the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideContextMenu();
        }
    });

    document.addEventListener('mousedown', (event) => {
        if (event.button === 2) { // Right mouse button is pressed
            isRightClicking = true;
            console.log('Right mouse button pressed');
            clickedElement = event.target; // Store the clicked element
            currentElement = event.target; // Store the clicked element as current element

            // Get the bounding rectangle of the body
            const bodyRect = document.body.getBoundingClientRect();

            // Calculate the adjusted coordinates relative to the body
            const adjustedX = event.clientX - bodyRect.left;
            const adjustedY = event.clientY - bodyRect.top;

            initialY = adjustedY; // Store initial Y coordinate of mouse click
            initialX = adjustedX; // Store initial X coordinate of mouse click
            highlightHierarchy(clickedElement, clickedElement); // Highlight clicked element

            // Display circles representing hierarchy levels
            circles = [];
            for (let i = 0; i <= getHierarchyLevel(clickedElement); i++) {
                const circle = document.createElement('div');
                circle.classList.add('hierarchy-circle');
                circle.style.position = 'absolute';
                let cr = i === 0 ? circleRadius * 2 : circleRadius
                circle.style.top = `${initialY - cr / 2 - i * circleSpacing}px`;
                circle.style.left = `${initialX - cr / 2}px`; // Adjust left position
                circle.style.width = `${cr}px`;
                circle.style.height = `${cr}px`;
                circle.style.borderRadius = '50%';
                circle.style.backgroundColor = i === 0 ? 'rgba(254, 156, 36, 0.762)' : 'rgba(0, 0, 0, 0.5)';
                document.body.appendChild(circle);
                circles.push(circle);
            }
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (isRightClicking) { // If right mouse button is pressed and slider line exists
            const { y } = getBodyRelativeXY(event);
            const deltaY = initialY - y; // Calculate deltaY
            const level = Math.floor(deltaY / circleSpacing); // Calculate current level
            if (level >= 0) {
                const hierarchyElement = getHierarchyElement(clickedElement, level);
                if (hierarchyElement) {
                    removeHighlight(currentElement); // Remove current highlight
                    currentElement = hierarchyElement; // Update clicked element
                    highlightHierarchy(clickedElement, currentElement); // Highlight new level
                    circles.forEach(c => c.style.backgroundColor = 'rgba(0, 0, 0, 0.5)');
                    circles[level].style.backgroundColor = 'rgba(254, 156, 36, 0.762)';
                }
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isRightClicking) {
            console.log('Right mouse button released', ts());
            isRightClicking = false; // Reset flag
            removeHighlight(clickedElement); // Remove highlight

            // Remove circles representing hierarchy levels
            circles?.forEach(circle => {
                if (circle.parentElement) {
                    circle.parentElement.removeChild(circle);
                }
            });
            triggerContextMenu(currentElement, initialX, initialY);

            clickedElement = null; // Reset clicked element
            currentElement = null;
        }
    });

    document.addEventListener('contextmenu', (event) => {
        console.log(ts(), event, isManualContextMenu);

        event.preventDefault(); // Prevent the default context menu
        if (isManualContextMenu) {
            isManualContextMenu = false;
        } else {
        }
    });

    // Function to get the hierarchy level of an element
    function getHierarchyLevel(element) {
        let level = 0;
        while (element.parentElement !== document.body) {
            level++;
            element = element.parentElement;
        }
        return level;
    }

    // Function to get the element corresponding to the hierarchy level based on the Y offset
    function getHierarchyElement(element, level) {
        for (let i = 0; i < level; i++) {
            if (element.parentElement === document.body) return null; // Reached the top level
            element = element.parentElement;
        }
        return element;
    }


    // Your custom logic for additional interactions
});
