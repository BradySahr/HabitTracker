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
    });
});
