const fileInput = document.getElementById('import-file');
const usernameInput = document.getElementById('username');
const usernameContainer = document.getElementById('username-container');
const header = document.getElementById('main-title');


// check is username saved in the browser storage 
const savedUser = localStorage.getItem('username');
if (savedUser) {
    header.textContent = `Welcome, ${savedUser}`;
} else {
    // if not show popup
    usernameContainer.removeAttribute('hidden');
}

// when the get started button is clicked save username 
document.getElementById('submit-btn').addEventListener('click', () => {
    const value = usernameInput.value.trim();
    if (value) {
        localStorage.setItem('username', value);
        header.textContent = `Welcome, ${value}`;
        usernameContainer.setAttribute('hidden', '');
    }
});
/*
   Data import and validation 
*/
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

// handle the file upload and reading the json file
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
/*
    Habit creation 
*/

function addHabits()
{
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');
    const modal = document.getElementById('modal');
    const addHabits = document.getElementById('add-habits');



       // show the create habit popup
     openBtn.addEventListener('click',()=>
    {
        console.log("Open clicked")
        modal.removeAttribute('hidden')    
    });

     // close and reset 
    closeBtn.addEventListener('click',()=>
    {
        modal.setAttribute('hidden','' );
        document.getElementById('habit-form').reset();
    });

    // handle submission 
    addHabits.addEventListener('click',(e)=>
    {
        e.preventDefault();


       
        console.log('Add Habit button clicked');
        const newHabit = {
            name: document.getElementById('habit-name').value,
            description: document.getElementById('habit-description').value,
            category: document.getElementById('habit-category').value,
            completed:false,
            scheduledDays:[],// 0-6
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
    renderDailyDashboard();
    });
       
}
addHabits();

/*
Theme
*/
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

/*
    Progress and calculation 
*/

// Weekly progress counters
function updateWeeklyProgress() {
    const habits = JSON.parse(localStorage.getItem('habit')) || [];
    const today = new Date();
    const dayIndex = today.getDay();

    // count how many habit scheduled for today are done
     const completedToday = habits.filter(habit =>
        habit.completed &&
        Array.isArray(habit.scheduledDays) &&
        habit.scheduledDays.includes(dayIndex)
    ).length;

      //highest streak across all habit
     const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);

    const completed = document.getElementById("completed-count");
    const streak = document.getElementById("streak-count");

    if (completed) completed.textContent = completedToday;
    if (streak) streak.textContent = maxStreak ;
}  
updateWeeklyProgress();

/*
 Habit Grid rendering 
*/

function renderHabitGrid() {
    const grid = document.getElementById('days-grid');
    if (!grid) return;

     //clear only habit data
    const habitRows = grid.querySelectorAll('.habit-name, .habit-box');
    habitRows.forEach(row => row.remove());

    const habits = JSON.parse(localStorage.getItem('habit')) || [];

    habits.forEach(habit => {
        //create the habit name cell
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit-name';
        habitDiv.textContent = habit.name;
        grid.appendChild(habitDiv);

        // create 7 clickable boxs for the day if the week
        for (let i = 0; i < 7; i++) {
            const box = document.createElement('div');
            box.className = 'habit-box';
            
            //if the day index is in the scheduled days highlight it
            if (Array.isArray(habit.scheduledDays) && habit.scheduledDays.includes(i)) {
                box.classList.add('selected');
            }
             
            // click listener selected/unselected habit for specific day
            box.addEventListener('click', () => {
                box.classList.toggle('selected');
                if (!Array.isArray(habit.scheduledDays)) habit.scheduledDays = [];
                
                const dayIndexInArray = habit.scheduledDays.indexOf(i);
                if (box.classList.contains('selected') && dayIndexInArray === -1) {
                    habit.scheduledDays.push(i);
                } else if (!box.classList.contains('selected') && dayIndexInArray > -1) {
                    habit.scheduledDays.splice(dayIndexInArray, 1);
                }
                
                localStorage.setItem('habit', JSON.stringify(habits));
                renderDailyDashboard(); // Refresh the top list
            });
            grid.appendChild(box);
        }
    });
}
 
        
renderHabitGrid();
/*
   Deletion logic
*/
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

/*
  Daily Dashboard rendering (Today's list)
*/
function renderDailyDashboard() {
    const today = new Date();
    const dayIndex = today.getDay();
    const dailyTracker = document.querySelector('.daily-tracker');
    if (!dailyTracker) return;

    //clear old elements avoid duplication 
    const oldElements = dailyTracker.querySelectorAll('.today-habit, .daily-desc, .daily-check, .daily-streak');
    oldElements.forEach(el => el.remove());

    const habits = JSON.parse(localStorage.getItem("habit")) || [];

    habits.forEach(habit => {
        //only show hbaits scheduled for current day
        if (habit.scheduledDays && habit.scheduledDays.includes(dayIndex)) {
            
            // Name
            const habitName = document.createElement('div');
            habitName.className = 'today-habit';
            habitName.textContent = habit.name;
            dailyTracker.appendChild(habitName);

            //description cell
            const description = document.createElement('div');
            description.className = 'daily-desc';
            description.textContent = habit.description || "No description";
            dailyTracker.appendChild(description);

            // checkbox cell=
            const checkWrapper = document.createElement('div');
            checkWrapper.className = 'daily-check';
            const checkBox = document.createElement('input');
            checkBox.type = 'checkbox';
            checkBox.checked = habit.completed || false;
            checkBox.addEventListener('change', () => {
                const allHabits = JSON.parse(localStorage.getItem('habit')) || [];
                const target = allHabits.find(h => h.name === habit.name);
                if (target) {
                    target.completed = checkBox.checked;
                    localStorage.setItem('habit', JSON.stringify(allHabits));
                }
                updateWeeklyProgress();
            });
            checkWrapper.appendChild(checkBox);
            dailyTracker.appendChild(checkWrapper);

            // streak cell
            const streakDiv = document.createElement('div');
            streakDiv.className = 'daily-streak';
            streakDiv.textContent = habit.streak || 0;
            dailyTracker.appendChild(streakDiv);
        }
    });
    updateWeeklyProgress();
}
 
renderDailyDashboard();
