const requestUrl = 'http://localhost:6500/api/shows/1/trailer/upload-request';
const uploadUrl = 'http://localhost:6500/api/shows/1/trailer/upload';
const fileType = 'jpg'
const CHUNK_SIZE = 50;

const uploadInput = document.querySelector('#upload-input');
const uploadHandler = document.querySelector('#upload-handler');
const progressIndicator = document.querySelector('#progress-indicator');
const uploadPauseHandler = document.querySelector('#upload-pause-handler');
const uploadResumeHandler = document.querySelector('#upload-resume-handler');

const fileReader = new FileReader();

uploadHandler.addEventListener('click', () => {
    const file = uploadInput.files[0];
    fileReader.onload = uploadFile(file)
    
    fileReader.readAsArrayBuffer(file);
})

const uploadFile = async (file) => {
    let iterations = file.size / CHUNK_SIZE;
    const uploadedChunkSize = await getUploadedChunkSize();
    
    console.log(uploadedChunkSize, (file.size));

    if ( uploadedChunkSize == 0 ) {
        console.log('uploading from scratch.');
        for ( let i = 0; i < iterations; i++ ) {
            const currentChunk = file.slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
            await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Length': file.size,
                    'Content-Type': 'application/octet-stream',
                    'File-Type': fileType
                },
                body: currentChunk
            })
    
            progressIndicator.innerText = `${Math.round(((i * CHUNK_SIZE) / file.size) * 100)}%`;
        } 
        
    } else if ( uploadedChunkSize < file.size ) {
        console.log('continuing uploading.');
        iterations = (file.size - uploadedChunkSize) / CHUNK_SIZE;

        for ( let i = 0; i < iterations; i++ ) {
            const currentChunk = file.slice(
                uploadedChunkSize + (CHUNK_SIZE * i),
                uploadedChunkSize + CHUNK_SIZE * (i + 1)
            );
            await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Length': file.size,
                    'Content-Type': 'application/octet-stream',
                    'File-Type': fileType      
                },
                body: currentChunk
            })
    
            progressIndicator.innerText = `${Math.round(((i * CHUNK_SIZE) / file.size) * 100)}%`;
        }

    } else {
        console.log('its fucking uploaded.')
    }

}

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