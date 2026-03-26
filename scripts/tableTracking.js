const cells = document.querySelectorAll(".track");
cells.forEach(cell => {
    cell.dataset.value = 0;
    cell.addEventListener("click", function () {
        if (cell.dataset.value == 0) {
            cell.dataset.value = 1;
            cell.classList.add("done");
        } 
        else {
            cell.dataset.value = 0;
            cell.classList.remove("done");
        }
        updateStreak();
    });
});
function countHabit(habitName) {
    const cells = document.querySelectorAll(`[data-habit="${habitName}"]`);
    cells.forEach(cell => {
    if(cell.dataset.value == 1){
        countHabit++;
    }
    });
    return countHabit;
}
const grid = document.getElementById("days-grid");
const completedCount = document.getElementById("completed-count");
const streakCount = document.getElementById("streak-count");

function updateCounts() {
    const selectedBoxes = document.querySelectorAll(".habit-box.selected");
    completedCount.textContent = selectedBoxes.length;

    const rows = document.querySelectorAll(".habit-row");
    let streak = 0;

    for (let day = 0; day < 7; day++) {
        let allDoneForDay = true;

        rows.forEach(row => {
            const boxes = row.querySelectorAll(".habit-box");
            if (!boxes[day].classList.contains("selected")) {
                allDoneForDay = false;
            }
        });

        if (allDoneForDay) {
            streak++;
        } else {
            break;
        }
    }

    streakCount.textContent = streak;
}

function makeHabitRow(habitName) {
    const row = document.createElement("div");
    row.className = "habit-row";

    const nameCell = document.createElement("div");
    nameCell.className = "habit-name";
    nameCell.textContent = habitName;
    row.appendChild(nameCell);

    for (let i = 0; i < 7; i++) {
        const box = document.createElement("div");
        box.className = "habit-box";

        box.addEventListener("click", function () {
            box.classList.toggle("selected");
            updateCounts();
        });

        row.appendChild(box);
    }

    grid.appendChild(row);
}

makeHabitRow("Clean Room");
makeHabitRow("Read");

updateCounts();