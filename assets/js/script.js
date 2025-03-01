// show or hide the menu when the button is clicked
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
    } else {
        menu.classList.add('show');
    }
}

// display the window, update its title,
// and create an icon in the toolbar
function openWindow(title, iconPath = 'icon.png', contentPath = '') {
    const windowElement = document.createElement('div');
    windowElement.classList.add('window');
    windowElement.style.overflow = 'hidden'; // prevent scrolling in outer window
    
    windowElement.innerHTML = `
        <div class="window-header">
            <div class="window-title">
                <img src="${iconPath}" alt="${title} icon">
                <h1>${title}</h1>
            </div>
            <div class="window-buttons">
                <button onclick="minimizeWindow(this)">
                    <img src="../assets/images/minimize-icon.ico" alt="Minimize">
                </button>
                <button onclick="maximizeWindow(this)">
                    <img src="../assets/images/maximize-icon.ico" alt="Maximize">
                </button>
                <button onclick="closeWindow(this)">
                    <img src="../assets/images/close-icon.ico" alt="Close">
                </button>
            </div>
        </div>
        <div class="window-content">
            <p>Loading content...</p>
        </div>
        <div class="resize-handle top-left"></div>
        <div class="resize-handle top-right"></div>
        <div class="resize-handle bottom-left"></div>
        <div class="resize-handle bottom-right"></div>
    `;
    document.body.appendChild(windowElement);

    windowElement.style.width = '85%';
    windowElement.style.height = '85vh';
    windowElement.style.left = '7%';
    windowElement.style.top = '5%';
    
    const contentContainer = windowElement.querySelector('.window-content');
    contentContainer.style.height = 'calc(100% - 30px)';
    contentContainer.style.position = 'relative';
    contentContainer.style.padding = '0';
    
    // load content from the specified path
    if (contentPath) {
        // use iframe for html content to preserve scripts
        if (contentPath.endsWith('.html')) {
            // For iframes, keep the container non-scrollable
            contentContainer.style.overflow = 'hidden';
            
            // fill the window with the content, except for tv
            if (contentPath === 'tv.html' || title === 'TV') {
                const iframe = document.createElement('iframe');
                iframe.src = contentPath;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.overflow = 'auto';
                
                contentContainer.innerHTML = '';
                contentContainer.appendChild(iframe);
            } else {
                const iframe = document.createElement('iframe');
                iframe.src = contentPath;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.overflow = 'auto';
                iframe.style.margin = '0';
                iframe.style.padding = '0';
                
                contentContainer.innerHTML = '';
                contentContainer.appendChild(iframe);
                
                contentContainer.style.margin = '0';
                contentContainer.style.padding = '0';
                contentContainer.style.border = 'none';
            }
        } else {
            contentContainer.style.overflow = 'auto';
            contentContainer.style.margin = '0';
            contentContainer.style.padding = '0';
            
            // fetch for non-html content
            fetch(contentPath)
                .then(response => response.text())
                .then(data => {
                    contentContainer.innerHTML = data;
                })
                .catch(error => {
                    contentContainer.innerHTML = 
                        `<p>Error loading content: ${error}</p>`;
                });
        }
    } else {
        contentContainer.style.overflow = 'auto';
        contentContainer.innerHTML = `<p>Content for ${title}</p>`;
    }

    // create an icon in the toolbar
    const openPrograms = document.getElementById('open-programs');
    const programIcon = document.createElement('img');
    programIcon.src = iconPath;
    programIcon.alt = title;

    // toggle on click
    programIcon.onclick = () => {
        if (windowElement.style.display === 'none') {
            windowElement.style.display = 'block'; // show
        } else {
            windowElement.style.display = 'none'; // hide
        }
    };

    // add the icon to the toolbar
    openPrograms.appendChild(programIcon);

    makeWindowDraggable(windowElement);
    makeWindowResizable(windowElement);

    return windowElement;
}


// close the window and remove its icon from the toolbar
function closeWindow(button) {
    const windowElement = button.closest('.window');
    windowElement.remove();

    // remove the icon from the toolbar
    const openPrograms = document.getElementById('open-programs');
    const programIcons = openPrograms.getElementsByTagName('img');
    for (let i = 0; i < programIcons.length; i++) {
        if (programIcons[i].alt === windowElement.querySelector('.window-header h1').innerText) {
            openPrograms.removeChild(programIcons[i]);
            break;
        }
    }
}

// minimize the window
function minimizeWindow(button) {
    const windowElement = button.closest('.window');
    windowElement.style.display = 'none';
}

// maximize or restore the window
function maximizeWindow(button) {
    const windowElement = button.closest('.window');
    const taskbarHeight = document.querySelector('.taskbar').offsetHeight;

    if (windowElement.classList.contains('maximized')) {
        windowElement.classList.remove('maximized');
        windowElement.style.width = '90%';
        windowElement.style.height = 'auto';
        windowElement.style.transform = '';
    } else {
        windowElement.classList.add('maximized');
        windowElement.style.width = '100vw';
        windowElement.style.height = `calc(100vh - ${taskbarHeight}px)`;
        windowElement.style.top = '0';
        windowElement.style.left = '0';
        windowElement.style.transform = 'none';
    }
}

// make the window draggable
function makeWindowDraggable(windowElement) {
    let isDragging = false;
    let offsetX, offsetY;

    // start dragging
    windowElement.querySelector('.window-header').addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // handle dragging
    function onMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        const headerHeight = windowElement.querySelector('.window-header').offsetHeight;

        // prevent dragging out of bounds
        if (newLeft < 0) newLeft = 0;
        if (newLeft + windowElement.offsetWidth > window.innerWidth) newLeft = window.innerWidth - windowElement.offsetWidth;
        if (newTop < 0) newTop = 0;
        // ensure the header is always visible -- before it was using window height, but that was causing the header to be hidden
        if (newTop + headerHeight > window.innerHeight - document.querySelector('.taskbar').offsetHeight) {
            newTop = window.innerHeight - document.querySelector('.taskbar').offsetHeight - headerHeight;
        }

        windowElement.style.left = `${newLeft}px`;
        windowElement.style.top = `${newTop}px`;
    }

    // stop dragging
    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

function makeWindowResizable(windowElement) {
    const resizeHandles = windowElement.querySelectorAll('.resize-handle');
    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            currentHandle = handle;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowElement.offsetWidth;
            startHeight = windowElement.offsetHeight;
            startLeft = windowElement.offsetLeft;
            startTop = windowElement.offsetTop;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });

    function onMouseMove(e) {
        if (!isResizing) return;
        e.preventDefault();

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        if (currentHandle.classList.contains('top-left')) {
            newWidth = startWidth - (e.clientX - startX);
            newHeight = startHeight - (e.clientY - startY);
            newLeft = startLeft + (e.clientX - startX);
            newTop = startTop + (e.clientY - startY);
        } else if (currentHandle.classList.contains('top-right')) {
            newWidth = startWidth + (e.clientX - startX);
            newHeight = startHeight - (e.clientY - startY);
            newTop = startTop + (e.clientY - startY);
        } else if (currentHandle.classList.contains('bottom-left')) {
            newWidth = startWidth - (e.clientX - startX);
            newHeight = startHeight + (e.clientY - startY);
            newLeft = startLeft + (e.clientX - startX);
        } else if (currentHandle.classList.contains('bottom-right')) {
            newWidth = startWidth + (e.clientX - startX);
            newHeight = startHeight + (e.clientY - startY);
        }

        // minimum size limits
        newWidth = Math.max(newWidth, 50);
        newHeight = Math.max(newHeight, 50);

       // ensure the window stays within the viewport
        if (newLeft < 0) newLeft = 0;
        const taskbarHeight = document.querySelector('.taskbar').offsetHeight;
        if (newTop < 0) newTop = 0;

        windowElement.style.width = newWidth + 'px';
        windowElement.style.height = newHeight + 'px';
        windowElement.style.left = newLeft + 'px';
        windowElement.style.top = newTop + 'px';
    }

    function onMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

function openMusicWindow() {
    openWindow('TV', '../assets/images/tv-icon.ico', 'tv.html');
}