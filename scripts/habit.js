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

// Set today's date dynamically
document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

/*
   Daily Reset Logic - Store completions and reset on new day
   Weekly Reset Logic - Reset weekly totals every Sunday
*/
function checkAndResetDailyTasks() {
    const today = new Date();
    const todayString = today.toDateString();
    const dayIndex = today.getDay();
    const lastDate = localStorage.getItem('lastDate');
    const lastWeekStart = localStorage.getItem('lastWeekStart');
    
    if (lastDate !== todayString) {
        // New day detected - store previous day's completions and reset
        const habits = JSON.parse(localStorage.getItem('habit')) || [];
        
        habits.forEach(habit => {
            // Store today's completion status in history if we had a previous date
            if (lastDate && habit.completed) {
                if (!Array.isArray(habit.completionHistory)) {
                    habit.completionHistory = [];
                }
                habit.completionHistory.push({
                    date: lastDate,
                    completed: true
                });
            }
            // Reset daily completion status for new day
            habit.completed = false;
        });
        
        localStorage.setItem('habit', JSON.stringify(habits));
        localStorage.setItem('lastDate', todayString);
    }
    
    // Check if it's Sunday (dayIndex === 0) - reset weekly counter
    if (dayIndex === 0 && lastWeekStart !== todayString) {
        // New week detected - reset weekly completed count
        const habits = JSON.parse(localStorage.getItem('habit')) || [];
        const currentWeekTotal = localStorage.getItem('weeklyCompletedTotal') || '0';
        
        // Store previous week's total if it exists
        if (currentWeekTotal !== '0') {
            let weeklyHistory = JSON.parse(localStorage.getItem('weeklyHistory')) || [];
            weeklyHistory.push({
                weekStart: lastWeekStart || 'unknown',
                completed: parseInt(currentWeekTotal)
            });
            localStorage.setItem('weeklyHistory', JSON.stringify(weeklyHistory));
        }
        
        // Reset weekly counter for new week
        localStorage.setItem('weeklyCompletedTotal', '0');
        localStorage.setItem('lastWeekStart', todayString);
    }
}

// Run check on page load
checkAndResetDailyTasks();

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

// Calculate streak based on consecutive days in completionHistory
function calculateStreak(habit) {
    if (!Array.isArray(habit.completionHistory) || habit.completionHistory.length === 0) {
        return 0;
    }
    
    // Convert dates to timestamps for reliable comparison
    const completedDates = habit.completionHistory
        .map(entry => {
            const date = new Date(entry.date);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        })
        .sort((a, b) => b - a); // Sort descending (most recent first)
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    let streak = 0;
    const oneDay = 1000 * 60 * 60 * 24; // milliseconds in one day
    
    // Check if today is in the completionHistory
    if (completedDates.includes(todayTime)) {
        streak = 1;
        
        // Count backward from yesterday
        for (let i = 1; i < completedDates.length; i++) {
            const expectedDate = todayTime - (i * oneDay);
            if (completedDates.includes(expectedDate)) {
                streak++;
            } else {
                break;
            }
        }
    }
    
    return streak;
}
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

    // Get the weekly total (accumulated throughout the week, resets on Sunday)
    const weeklyTotal = parseInt(localStorage.getItem('weeklyCompletedTotal')) || 0;

    // Maximum streak across all habits
    const maxStreak = habits.length > 0 ? habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0) : 0;

    const completed = document.getElementById("completed-count");
    const streak = document.getElementById("streak-count");

    if (completed) completed.textContent = weeklyTotal;
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
                    const wasCompleted = target.completed;
                    target.completed = checkBox.checked;
                    
                    // Update completion history for today
                    if (!Array.isArray(target.completionHistory)) {
                        target.completionHistory = [];
                    }
                    
                    const todayString = today.toDateString();
                    const todayEntry = target.completionHistory.find(e => e.date === todayString);
                    
                    if (checkBox.checked && !todayEntry) {
                        // Mark as completed today - increment streak
                        target.completionHistory.push({
                            date: todayString,
                            completed: true
                        });
                        target.streak = (target.streak || 0) + 1;
                    } else if (!checkBox.checked && todayEntry) {
                        // Remove today's completion - decrement streak
                        target.completionHistory = target.completionHistory.filter(e => e.date !== todayString);
                        target.streak = Math.max(0, (target.streak || 0) - 1);
                    }
                    
                    localStorage.setItem('habit', JSON.stringify(allHabits));
                    
                    // Update weekly total
                    if (checkBox.checked && !wasCompleted) {
                        const weeklyTotal = parseInt(localStorage.getItem('weeklyCompletedTotal')) || 0;
                        localStorage.setItem('weeklyCompletedTotal', (weeklyTotal + 1).toString());
                    } else if (!checkBox.checked && wasCompleted) {
                        const weeklyTotal = parseInt(localStorage.getItem('weeklyCompletedTotal')) || 0;
                        localStorage.setItem('weeklyCompletedTotal', Math.max(0, weeklyTotal - 1).toString());
                    }
                }
                renderDailyDashboard();
                updateWeeklyProgress();
            });
            checkWrapper.appendChild(checkBox);
            dailyTracker.appendChild(checkWrapper);

            // streak cell
            const streakDiv = document.createElement('div');
            streakDiv.className = 'daily-streak';
            // Recalculate streak to ensure it's current
            habit.streak = calculateStreak(habit);
            streakDiv.textContent = habit.streak;
            dailyTracker.appendChild(streakDiv);
        }
    });
    updateWeeklyProgress();
}
 
renderDailyDashboard();
