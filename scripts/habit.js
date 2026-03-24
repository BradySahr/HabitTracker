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

            // Check if we have existing habits
            const existingHabits = JSON.parse(localStorage.getItem('habit')) || [];
            
            // push to existing array
            existingHabits.push(...habit);
            
            localStorage.setItem('habit', JSON.stringify(existingHabits));
            console.log('Habits imported:', existingHabits);

            renderHabitGrid();
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
        document.getElementById('habit-form').reset();
    });

    addHabits.addEventListener('click',(e)=>
    {
        e.preventDefault(); 

        
        console.log('Add Habit button clicked');
        const newHabit = {
            name: document.getElementById('habit-name').value,
            description: document.getElementById('habit-description').value,
            category: document.getElementById('habit-category').value,
            completed:false,
            scheduledDays:[],
            completionHistory:[],
            streak:0
        };
        console.log(newHabit);

    const exsitingHabit =JSON.parse(localStorage.getItem('habit') )|| [];
    exsitingHabit.push(newHabit);
    localStorage.setItem('habit',JSON.stringify(exsitingHabit));
    modal.setAttribute('hidden','' );
    document.getElementById('habit-form').reset();
    renderHabitGrid();
    });
        



}
addHabits();

const themeSelect = document.getElementById('theme-select');

function themeChange() {
    const selectedTheme = themeSelect.value;
    
    // Apply the theme using the data-theme attribute 
    document.documentElement.setAttribute('data-theme', selectedTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', selectedTheme);
}

// Listen for changes in the dropdown
themeSelect.addEventListener('change', themeChange);

// Apply the saved theme  
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

function renderHabitGrid()
{
    const grid =document.getElementById('days-grid');
     if (!grid) return;

    // Clear existing habit rows (keep header and day labels)
    const habitRows = grid.querySelectorAll('.habit-name, .habit-box');
    habitRows.forEach(row => row.remove());

    const habits = JSON.parse(localStorage.getItem('habit')) || [];

    habits.forEach( habit =>
    {
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit-name';
        habitDiv.textContent=habit.name;
        grid.appendChild(habitDiv);

        for (let i=1;i<=7;i++)
        {
            const box =document.createElement('div');
            box.className='habit-box';   
            
            // highligh the box if this day is already in json
            if (Array.isArray(habit.scheduledDays) && habit.scheduledDays.includes(i)) {
                box.classList.add('selected');
            }

            box.addEventListener('click',()=>
            {
                console.log(`Day ${i} clicked for habit '${habit.name}'`);
                box.classList.toggle('selected');
                habit.scheduledDays.push(i);
                habit.scheduledDays.sort();
                
                
                // save back to localStorage
                localStorage.setItem('habit', JSON.stringify(habits));
            });
            grid.appendChild(box);
        
        }
    }
    )
}
renderHabitGrid();

// Remove Habit
document.getElementById('remove-btn').addEventListener('click', () => {
    const habitName = prompt('Enter the habit name to remove:');
    if (habitName) {
        const habits = JSON.parse(localStorage.getItem('habit')) || [];
        // Find the last index with matching name
        const lastIndex = habits.findLastIndex(h => h.name === habitName);
        if (lastIndex > -1) {
            habits.splice(lastIndex, 1);
            localStorage.setItem('habit', JSON.stringify(habits));
            renderHabitGrid();
        } else {
            alert('Habit not found.');
        }
    }
});

function renderDailyDashboard()
{

}