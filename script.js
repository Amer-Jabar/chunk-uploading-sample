const requestUrl = 'http://localhost:6500/api/shows/something17/trailer/upload-request';
const uploadUrl = 'http://localhost:6500/api/shows/something17/trailer/upload';
const fileType = 'jpg'
const CHUNK_SIZE = 100;

const uploadInput = document.querySelector('#upload-input');
const uploadHandler = document.querySelector('#upload-handler');
const progressIndicator = document.querySelector('#progress-indicator');
const uploadPauseHandler = document.querySelector('#upload-pause-handler');
const uploadResumeHandler = document.querySelector('#upload-resume-handler');

const fileReader = new FileReader();
let pauseUpload = false;

uploadHandler.addEventListener('click', () => {
    pauseUpload = false;
    const file = uploadInput.files[0];
    fileReader.onload = uploadFile(file)

    fileReader.readAsArrayBuffer(file);
})

const uploadFile = async (file) => {

    let iterations = file.size / CHUNK_SIZE;
    const uploadedChunkSize = await getUploadedChunkSize();
    
    console.log(uploadedChunkSize, (file.size));
    console.log(
        uploadedChunkSize == 0
        ? 'Uploading from scratch'
        : uploadedChunkSize < file.size
        ? 'Continuing uploading file'
        : 'File is uploaded'
    );
    iterations = (file.size - uploadedChunkSize) / CHUNK_SIZE;

    for ( let i = 0; i < iterations; i++ ) {

        if ( pauseUpload )
            return;

        const currentChunk = file.slice(
            uploadedChunkSize + (CHUNK_SIZE * i),
            uploadedChunkSize + CHUNK_SIZE * (i + 1)
        );

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Content-Length': file.size,
                'Content-Type': 'application/octet-stream',
                'File-Type': fileType
            },
            body: currentChunk
        })
        const { currentUploadedChunkSize } = await response.json();

        progressIndicator.innerText = `${Math.round((currentUploadedChunkSize / file.size) * 100)}%`;
    }

}

uploadPauseHandler.addEventListener('click', () => pauseUpload = true)

const getUploadedChunkSize = async () => {
    try {
        let response = await fetch(`${requestUrl}`, {
            method: 'GET',
            headers: {
                'File-Type': fileType
            }
        })
        let jsonData = await response.json();
        return jsonData.uploadedChunkSize;   
    } catch ( e ) {
        return 0;
    }
}