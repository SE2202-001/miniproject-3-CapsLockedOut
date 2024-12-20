class Job {
    constructor(jobNo, title, jobPageLink, posted, type, level, estimatedTime, skill, detail) {
        this.jobNo = jobNo;
        this.title = title;
        this.jobPageLink = jobPageLink;
        this.posted = posted;
        this.type = type;
        this.level = level;
        this.estimatedTime = estimatedTime;
        this.skill = skill;
        this.detail = detail;
    }

    getDetails() {
        return `${this.title} - ${this.type} (${this.level})`;
    }
    
    getFormattedPostedTime() {
        const parts = this.posted.split(' ');
        const number = parseInt(parts[0]);
        const unit = parts[1];

        let milliseconds = 0;
        if (unit === 'minute' || unit === 'minutes') {
            milliseconds = number * 60000;
        } else if (unit === 'hour' || unit === 'hours') {
            milliseconds = number * 3600000;
        }

        return Date.now() - milliseconds;
    }
}

const fileInput = document.getElementById('fileInput');
const levelFilter = document.getElementById('levelFilter');
const typeFilter = document.getElementById('typeFilter');
const skillFilter = document.getElementById('skillFilter');
const filterButton = document.getElementById('filterButton');
const sortBy = document.getElementById('sortBy');
const jobList = document.getElementById('jobList');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);

            const jobs = [];
            let filteredJobs = [];
            let sortedJobs = [];
            let filtered = false;
            jsonData.forEach(job => {
                jobs.push(new Job(
                    job["Job No"],
                    job["Title"],
                    job["Job Page Link"],
                    job["Posted"],
                    job["Type"],
                    job["Level"],
                    job["Estimated Time"],
                    job["Skill"],
                    job["Detail"]
                ));
            });        

            // Populate filter options only once (move outside the function)
            const levels = new Set(jobs.map(job => job.level));
            const types = new Set(jobs.map(job => job.type));
            const skills = new Set(jobs.map(job => job.skill));
                    
            displayJobs(jobs);

            populateSelectOptions('levelFilter', levels);
            populateSelectOptions('typeFilter', types);
            populateSelectOptions('skillFilter', skills);

            filterButton.addEventListener('click', () => {
                filteredJobs = jobs.filter(job => {
                    return (levelFilter.value === '' || job.level === levelFilter.value) &&
                           (typeFilter.value === '' || job.type === typeFilter.value) &&
                           (skillFilter.value === '' || job.skill === skillFilter.value);
                });
                filtered = true;
                displayJobs(filteredJobs);
            });

            sortBy.addEventListener('change', () => {
                sortedJobs = [...jobs]; // Create a copy to avoid modifying original array
                if (filtered == true) {
                    sortedJobs = [...filteredJobs];
                }
                if (sortBy.value === 'titleAZ') {
                    sortedJobs.sort((a, b) => a.title.localeCompare(b.title));
                } else if (sortBy.value === 'titleZA') {
                    sortedJobs.sort((a, b) => b.title.localeCompare(a.title));
                } else if (sortBy.value === 'postedTimeNewest') {
                    sortedJobs.sort((a, b) => {
                        return b.getFormattedPostedTime() - a.getFormattedPostedTime(); // Newest first
                    });
                } else if (sortBy.value === 'postedTimeOldest') {
                    sortedJobs.sort((a, b) => {
                        return a.getFormattedPostedTime() - b.getFormattedPostedTime(); // Oldest first
                    });
                }
                displayJobs(sortedJobs);
            });

        } catch (error) {
            alert('Please upload a valid JSON file');
            jobList.innerHTML = '<b>No jobs available.</b>'; // Clear the job list
            return;
            // Display an error message to the user
        }
    };

    reader.readAsText(file);
});

function populateSelectOptions(selectElementID, options) {
    const selectElement = document.getElementById(selectElementID);
    selectElement.innerHTML = '<option value="">All</option>';
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
    });
}

function displayJobDetails(job) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');

    modalTitle.innerHTML = '<u>Job Details</u>';

    modalDetails.innerHTML = `
        <b>Title:</b> ${job.title}<br>
        <b>Type:</b> ${job.type}<br>
        <b>Level:</b> ${job.level}<br>
        <b>Skill:</b> ${job.skill}<br>
        <b>Description:</b> ${job.detail}<br>
        <b>Posted:</b> ${job.posted}<br>
    `;

    modal.style.display = 'block';

    // Add a click event listener to the close button
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
});
    
}

function displayJobs(jobs) {
    jobList.innerHTML = '';
    if (jobs.length === 0) {
        const noJobsMessage = document.createElement('p');
        noJobsMessage.innerHTML = '<b>No jobs available.</b>';
        jobList.appendChild(noJobsMessage);
        return;
    }
    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('job-card');
        jobCard.textContent = job.getDetails();
    
        jobCard.addEventListener('click', () => {
            displayJobDetails(job);
        });
    
        jobList.appendChild(jobCard);
    });

}