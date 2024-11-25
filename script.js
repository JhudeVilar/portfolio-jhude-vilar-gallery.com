const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close');
    const errorMessage = document.getElementById('errorMessage');

    // Load files from localStorage on page load
    window.addEventListener('load', loadFiles);

    // Handle file selection
    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const files = event.target.files;
        errorMessage.textContent = ''; // Clear previous error messages
        if (files) {
            [...files].forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileHash = generateHash(e.target.result);
                    if (isDuplicate(fileHash)) {
                        errorMessage.textContent = `Duplicate file "${file.name}" rejected.`;
                    } else {
                        if (file.type.startsWith('image/')) {
                            displayImage(e.target.result, fileHash);
                        } else if (file.type.startsWith('video/')) {
                            displayVideo(e.target.result, fileHash);
                        }
                        saveFile(file, e.target.result, fileHash);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }

    // Function to display images
    function displayImage(src, hash) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('preview-wrapper');
        
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('preview');
        img.onclick = () => openModal('image', src);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent modal opening
            deleteFile(hash, wrapper);
        };

        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        previewContainer.appendChild(wrapper);
    }

    // Function to display videos
    function displayVideo(src, hash) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('preview-wrapper');
        
        const video = document.createElement('video');
        video.src = src;
        video.classList.add('preview');
        video.controls = false;
        video.onclick = () => openModal('video', src);
        video.onmouseenter = () => video.pause(); // Pause video on hover

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent modal opening
            deleteFile(hash, wrapper);
        };

        wrapper.appendChild(video);
        wrapper.appendChild(deleteBtn);
        previewContainer.appendChild(wrapper);
    }

    // Open modal to enlarge image or video
    function openModal(type, src) {
        modal.style.display = 'flex';
        modalContent.innerHTML = ''; // Clear previous content
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = src;
            modalContent.appendChild(img);
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true; // Autoplay video
            modalContent.appendChild(video);
        }
    }

    // Close the modal
    closeModal.onclick = function() {
        modal.style.display = 'none';
        modalContent.innerHTML = ''; // Clear modal content
        const video = modalContent.querySelector('video');
        if (video) video.pause(); // Pause any playing video in the modal
    };

    // Close the modal when clicking outside the content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            modalContent.innerHTML = ''; // Clear modal content
            const video = modalContent.querySelector('video');
            if (video) video.pause();
        }
    };

    // Save files to localStorage
    function saveFile(file, dataUrl, hash) {
        let savedFiles = JSON.parse(localStorage.getItem('savedFiles')) || [];
        savedFiles.push({ name: file.name, type: file.type, dataUrl, hash });
        localStorage.setItem('savedFiles', JSON.stringify(savedFiles));
    }

    // Load saved files from localStorage
    function loadFiles() {
        const savedFiles = JSON.parse(localStorage.getItem('savedFiles')) || [];
        savedFiles.forEach(file => {
            if (file.type.startsWith('image/')) {
                displayImage(file.dataUrl, file.hash);
            } else if (file.type.startsWith('video/')) {
                displayVideo(file.dataUrl, file.hash);
            }
        });
    }

    // Generate hash to check for duplicate files
    function generateHash(dataUrl) {
        let hash = 0;
        for (let i = 0; i < dataUrl.length; i++) {
            const char = dataUrl.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    // Check if the file is a duplicate
    function isDuplicate(hash) {
        const savedFiles = JSON.parse(localStorage.getItem('savedFiles')) || [];
        return savedFiles.some(file => file.hash === hash);
    }

    // Delete a file from both the display and localStorage
    function deleteFile(hash, wrapper) {
        let savedFiles = JSON.parse(localStorage.getItem('savedFiles')) || [];
        savedFiles = savedFiles.filter(file => file.hash !== hash);
        localStorage.setItem('savedFiles', JSON.stringify(savedFiles));
        wrapper.remove(); // Remove the preview from the display
    }