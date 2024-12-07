// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.querySelector('.preview-container');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const compressionRatio = document.getElementById('compressionRatio');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinners = document.querySelectorAll('.loading-spinner');

// 常量定义
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 点击上传
dropZone.onclick = function() {
    fileInput.click();
};

// 文件选择变化
fileInput.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndProcessImage(file);
    }
};

// 拖放上传
dropZone.ondragover = function(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
};

dropZone.ondragleave = function(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
};

dropZone.ondrop = function(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
        validateAndProcessImage(file);
    }
};

// 验证并处理图片
function validateAndProcessImage(file) {
    hideError();
    
    // 验证文件类型
    if (!SUPPORTED_TYPES.includes(file.type)) {
        showError('请上传 PNG、JPG 或 WebP 格式的图片');
        return;
    }
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
        showError('图片大小不能超过 20MB');
        return;
    }

    handleImage(file);
}

// 处理图片
function handleImage(file) {
    showLoading();
    originalSize.textContent = formatSize(file.size);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage.src = e.target.result;
        originalImage.onload = function() {
            originalImage.classList.add('loaded');
            hideLoading(0);
            compressImage(e.target.result, qualitySlider.value / 100);
        };
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(base64, quality) {
    showLoading(1);
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        compressedImage.src = compressedBase64;
        compressedImage.onload = function() {
            compressedImage.classList.add('loaded');
            hideLoading(1);
        };
        
        const originalBytes = Math.round((base64.length * 3) / 4);
        const compressedBytes = Math.round((compressedBase64.length * 3) / 4);
        const ratio = ((originalBytes - compressedBytes) / originalBytes * 100).toFixed(1);
        
        compressedSize.textContent = formatSize(compressedBytes);
        compressionRatio.textContent = `(减小 ${ratio}%)`;
        compressionRatio.style.color = ratio > 0 ? '#34c759' : '#ff3b30';
        
        downloadBtn.onclick = function() {
            const link = document.createElement('a');
            link.download = `compressed_${Date.now()}.jpg`;
            link.href = compressedBase64;
            link.click();
        };
    };
    img.src = base64;
}

// 显示错误信息
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// 隐藏错误信息
function hideError() {
    errorMessage.style.display = 'none';
}

// 显示加载动画
function showLoading(index = 0) {
    loadingSpinners[index].style.display = 'block';
}

// 隐藏加载动画
function hideLoading(index = 0) {
    loadingSpinners[index].style.display = 'none';
}

// 格式化文件大小
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 质量滑块变化
qualitySlider.oninput = function(e) {
    const quality = e.target.value;
    qualityValue.textContent = quality + '%';
    if (originalImage.src) {
        compressImage(originalImage.src, quality / 100);
    }
};