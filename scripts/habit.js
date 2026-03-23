const fileInput = document.getElementById('import-file');
const usernameInput = document.getElementById('username');
const usernameContainer = document.getElementById('username-container');
const header = document.getElementById('main-title');

// Username
const savedUser = localStorage.getItem('username');
if (savedUser) {
    header.textContent = `Welcome, ${savedUser}`;
} else {
    usernameContainer.removeAttribute('hidden');
}

document.getElementById('submit-btn').addEventListener('click', () => {
    const value = usernameInput.value.trim();
    if (value) {
        localStorage.setItem('username', value);
        header.textContent = `Welcome, ${value}`;
        usernameContainer.setAttribute('hidden', '');
    }
});
function validateHabits(data) {
    if(!Array.isArray(data))
    {
        throw new Error('Invalid Format: JSON must be an array of habits')
    }

    // Check if array is empty
    if (data.length === 0) {
                throw new Error('JSON file is empty');
      }
    
    data.forEach((habit, index) => {
        if (!habit.hasOwnProperty('id')) {
            throw new Error(`Habit at index ${index} is missing 'id' property`);
        }
        if (!habit.hasOwnProperty('name')) {
            throw new Error(`Habit at index ${index} is missing 'name' property`);
        }
        if(!habit.hasOwnProperty('completed'))
        {
            throw new Error(`Habit at index ${index} is missing 'completed' property`);
        }
    });
    return true;
}

fileInput.addEventListener('change',(e)=>
{
    const file =e.target.files[0];

    if(!file) return
    console.log('Reading file:', file.name);
    const reader = new FileReader();

    reader.addEventListener('load', (e) => 
    {
        try
        {
            const habit = JSON.parse(e.target.result);

             // Validate structure
            validateHabits(habit);
             
            localStorage.setItem('habit', JSON.stringify(habit));
            const retrieve = JSON.parse(localStorage.getItem("habit"));
            console.log('Habits imported:', retrieve);
        }
        catch (error)
        {
            console.error('Error parsing JSON:', error);
        }
        
    });

    reader.readAsText(file);
});

function addHabits()
{
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');
    const modal = document.getElementById('modal');
    const addHabits = document.getElementById('add-habits');

     openBtn.addEventListener('click',()=>
    {
        console.log("Open clicked")
        modal.removeAttribute('hidden')    
    });

    closeBtn.addEventListener('click',()=>
    {
        modal.setAttribute('hidden','' );
    });




}
addHabits();

const themeSelect = document.getElementById('theme-select');

function themeChange() {
    const selectedTheme = themeSelect.value;
    
    // Apply the theme using the data-theme attribute to match your CSS rules
    document.documentElement.setAttribute('data-theme', selectedTheme);
    
    // Save the user's preference to localStorage
    localStorage.setItem('theme', selectedTheme);
}

// Listen for changes in the dropdown
themeSelect.addEventListener('change', themeChange);

// Apply the saved theme immediately when the page loads
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    themeSelect.value = savedTheme;
    themeChange();
} 
// Weekly progress counters
let completedCount = 0;
let streakCount = 0;

function updateWeeklyProgress() {
    const completed = document.getElementById("completed-count");
    const streak = document.getElementById("streak-count");

    if (completed) completed.textContent = completedCount;
    if (streak) streak.textContent = streakCount;
}  
updateWeeklyProgress();
