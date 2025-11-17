const boxes = document.querySelectorAll('#box-container img.box');
const valueContainer = document.getElementById('value-container');

const answers = [
    '200',
    '"Hello World"',
    'false',
    'true',
    '40'
];

const boxTypes = ['string', 'bool', 'int']; 

let currentIndex = 0;


function spawnValue() {
    const valueText = answers[currentIndex];
    const div = document.createElement('div');
    div.textContent = valueText;

   
    div.style.left = Math.random() * 400 + 50 + 'px';
    div.style.top = Math.random() * 300 + 50 + 'px';
    div.style.position = 'absolute';
    div.style.padding = '10px';
    div.style.backgroundColor = 'rgba(255,255,255,0.7)';
    div.style.border = '1px solid black';
    div.style.cursor = 'grab';
    div.style.userSelect = 'none';
    div.style.fontSize = '40px';

    valueContainer.appendChild(div);

    const originalPosition = { left: div.offsetLeft, top: div.offsetTop };

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    div.addEventListener('mousedown', e => {
        isDragging = true;
        offsetX = e.clientX - div.offsetLeft;
        offsetY = e.clientY - div.offsetTop;
        div.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        div.style.left = e.clientX - offsetX + 'px';
        div.style.top = e.clientY - offsetY + 'px';

        boxes.forEach(box => {
            const rect = box.getBoundingClientRect();
            if (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            ) {
                box.classList.add('highlight');
            } else {
                box.classList.remove('highlight');
            }
        });
    });

    document.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        div.style.cursor = 'grab';

        let droppedOnBox = null;
        boxes.forEach(box => {
            const rect = box.getBoundingClientRect();
            if (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            ) {
                droppedOnBox = box;
            }
            box.classList.remove('highlight');
        });

        if (droppedOnBox) {
            const boxIndex = Array.from(boxes).indexOf(droppedOnBox);

            const divText = div.textContent.replace(/"/g, '').trim();
            const divType = isNaN(divText) ? (divText === 'true' || divText === 'false' ? 'bool' : 'string') : 'int';

            if (divType !== boxTypes[boxIndex]) {
          
                div.style.left = originalPosition.left + 'px';
                div.style.top = originalPosition.top + 'px';

                const xOverlay = document.createElement('img');
                xOverlay.src = 'x.png';
                xOverlay.style.position = 'absolute';
                xOverlay.style.width = '200px';
                xOverlay.style.height = '200px';
                xOverlay.style.top = '50%';
                xOverlay.style.left = '50%';
                xOverlay.style.transform = 'translate(-50%, -50%)';
                droppedOnBox.parentElement.appendChild(xOverlay);

                setTimeout(() => {
                    xOverlay.remove();
                }, 1000);
            } else {
            
                div.remove();

                const checkOverlay = document.createElement('img');
                checkOverlay.src = 'check.png';
                checkOverlay.style.position = 'absolute';
                checkOverlay.style.width = '200px';
                checkOverlay.style.height = '200px';
                checkOverlay.style.top = '50%';
                checkOverlay.style.left = '50%';
                checkOverlay.style.transform = 'translate(-50%, -50%)';
                droppedOnBox.parentElement.appendChild(checkOverlay);

                setTimeout(() => {
                    checkOverlay.remove();
                   
                    currentIndex = (currentIndex + 1) % answers.length;
                    spawnValue();
                }, 1000);
            }
        }
    });
}


spawnValue();
