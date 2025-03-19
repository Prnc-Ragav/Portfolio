document.addEventListener('DOMContentLoaded', function() {
    const scroll_x = document.querySelector('.scroll-x');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const dots = document.querySelectorAll('.dot');
    
    let currentIndex = 0;
    let isScrolling = false;
    let isMobileView = window.innerWidth <= 1000;
    
    // Function to update navigation
    function updateNav(index) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks[index].classList.add('active');
        
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        
        currentIndex = index;
    }
    
    // Detect which section is currently viewed
    function getCurrentSection() {
        if (isMobileView) {
            // For mobile: determine based on vertical scroll position
            const scrollTop = window.scrollY;
            let closestSection = 0;
            let minDistance = Infinity;
            
            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const distance = Math.abs(scrollTop - sectionTop);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSection = index;
                }
            });
            
            return closestSection;
        }
        else {
            const containerScroll = scroll_x.scrollLeft;
            const windowWidth = window.innerWidth;
        
            return Math.round(containerScroll / windowWidth);
        }
    }
    
    // Scroll to specific section
    function scrollToSection(index) {
        isScrolling = true;
        
        if (isMobileView) {
            // Vertical scrolling for mobile
            window.scrollTo({
                top: sections[index].offsetTop,
                behavior: 'smooth'
            });
        }
        else{
            scroll_x.scrollTo({
                left: index * window.innerWidth,
                behavior: 'smooth'
            });
        }
        
        updateNav(index);
        
        // Reset isScrolling after animation completes
        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }
    
    // Handle wheel event (convert vertical scroll to horizontal)
    document.addEventListener('wheel', function(e) {
    if (isMobileView) return;
    else {
        e.preventDefault();
        if (isScrolling) return;
        
        // Handle vertical scrolling (deltaY)
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Convert vertical scroll to horizontal movement
        if (e.deltaY > 0 && currentIndex < sections.length - 1) {
            // Scroll down = move right to next section
            scrollToSection(currentIndex + 1);
        } else if (e.deltaY < 0 && currentIndex > 0) {
            // Scroll up = move left to previous section
            scrollToSection(currentIndex - 1);
        }
        } 
        // Handle horizontal scrolling (deltaX)
        else {
        // Direct horizontal movement - fixed directions
        if (e.deltaX > 0 && currentIndex < sections.length - 1) {
            // Scroll right (positive deltaX) = move right to next section
            scrollToSection(currentIndex + 1);
        } else if (e.deltaX < 0 && currentIndex > 0) {
            // Scroll left (negative deltaX) = move left to previous section
            scrollToSection(currentIndex - 1);
        }
        }
    }
    }, { passive: false });
    
    // Handle click on navigation links
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection(index);
        });
    });
    
    // Handle click on dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            scrollToSection(index);
        });
    });

    function handleScroll() {
        if (!isScrolling) {
            const index = getCurrentSection();
            if (index !== currentIndex) {
                updateNav(index);
            }
        }
    }
    
    // Handle scroll event to update navigation
    window.addEventListener('scroll', handleScroll); // For mobile view
    scroll_x.addEventListener('scroll', handleScroll); // For desktop view



    const languageButtons = document.querySelectorAll(".language-btn");
    const projectsContainer = document.querySelector(".projects-container");
    const projectCards = document.querySelectorAll(".project-card");
    let initialDuration = null;
    let initialTotalWidth = null;

    function duplicateProjects() {
        projectsContainer.innerHTML = ""; 

        const allCards = [...projectCards, ...projectCards, ...projectCards]; 
        allCards.forEach((card) => {
            const clone = card.cloneNode(true);
            projectsContainer.appendChild(clone);
        });

        updateScrolling(true); 
    }

    // Function to filter and display projects
    function updateProjectsContainer(language) {
        projectsContainer.innerHTML = ""; 

        // Filter projects based on selected language
        let filteredCards = [];
        projectCards.forEach((card) => {
            if (language === "all" || card.getAttribute("data-category") === language) {
                filteredCards.push(card.cloneNode(true));
            }
        });

        // For "all" category, duplicate cards for seamless looping
        if (language === "all" && filteredCards.length > 0) {
            filteredCards = [...filteredCards, ...filteredCards, ...filteredCards];
        }

        filteredCards.forEach((card) => projectsContainer.appendChild(card));

        updateScrolling(language === "all");
    }

    // Function to adjust scrolling animation based on content width and selected language
    function updateScrolling(isAllCategory) {
        if (isAllCategory) {
            if (initialTotalWidth === null) {
                let totalWidth = 0;
                const cards = projectsContainer.querySelectorAll(".project-card");
                cards.forEach((card) => {
                    totalWidth += card.offsetWidth + 32; // Account for gap (2rem)
                });
                initialTotalWidth = totalWidth;
                
                const containerWidth = projectsContainer.parentElement.offsetWidth;
                const cardCount = cards.length;
                initialDuration = Math.max(15, cardCount * 1.5); // At least 15 seconds
            }
            
            // Reset any previous settings
            projectsContainer.style.transform = "translateX(0)";
            
            // Disable user scrolling for "all" category
            projectsContainer.style.overflowX = "hidden";
            projectsContainer.parentElement.style.overflowX = "hidden";
            
            // Apply animation using the stored initial values
            if (initialTotalWidth > projectsContainer.parentElement.offsetWidth) {
                projectsContainer.style.animation = `scrollProjects ${initialDuration}s linear infinite`;
                
                // Create a CSS rule for the animation
                const styleSheet = document.styleSheets[0];
                let animationRule = `
                    @keyframes scrollProjects {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-${initialTotalWidth / 3}px); }
                    }
                `;
                
                // Find and remove any existing scrollProjects animation
                for (let i = 0; i < styleSheet.cssRules.length; i++) {
                    if (styleSheet.cssRules[i].name === 'scrollProjects') {
                        styleSheet.deleteRule(i);
                        break;
                    }
                }
                
                // Add the new animation rule
                try {
                    styleSheet.insertRule(animationRule, styleSheet.cssRules.length);
                } catch (e) {
                    // If inserting to the stylesheet fails, create a new style element
                    const styleElement = document.createElement('style');
                    styleElement.textContent = animationRule;
                    document.head.appendChild(styleElement);
                }
            } else {
                projectsContainer.style.animation = "none";
            }
        } else {
            // Enable user scrolling for other categories
            projectsContainer.style.animation = "none";
            projectsContainer.style.overflowX = "auto";
            projectsContainer.parentElement.style.overflowX = "auto";
            projectsContainer.style.scrollBehavior = "smooth";
        }
    }

    // // Add hover pause functionality
    // projectsContainer.addEventListener('mouseenter', () => {
    //     if (projectsContainer.style.animation !== "none") {
    //         projectsContainer.style.animationPlayState = 'paused';
    //     }
    // });

    // projectsContainer.addEventListener('mouseleave', () => {
    //     if (projectsContainer.style.animation !== "none") {
    //         projectsContainer.style.animationPlayState = 'running';
    //     }
    // });

    languageButtons.forEach((button) => {
        button.addEventListener("click", function () {
            languageButtons.forEach((btn) => btn.classList.remove("active"));
            this.classList.add("active");

            const language = this.getAttribute("data-language");
            updateProjectsContainer(language);
        });
    });

    // Initial setup to show all projects and enable scrolling
    duplicateProjects();

    const skillTabs = document.querySelectorAll('.skill-tab');
    const skillCategories = document.querySelectorAll('.skills-category');
    
    skillTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            skillTabs.forEach(t => t.classList.remove('active'));
            
            this.classList.add('active');
            
            skillCategories.forEach(category => {
                category.classList.remove('active');
            });
            
            const categoryToShow = this.getAttribute('data-category');
            document.getElementById(`${categoryToShow}-skills`).classList.add('active');
        });
    });
    
    // Update on window resize
    window.addEventListener('resize', function() {
        const wasMobileView = isMobileView;
        isMobileView = window.innerWidth <= 1000;
        
        // If view mode changed, reposition to current section
        if (wasMobileView !== isMobileView) {
            scrollToSection(currentIndex);
        }
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (isScrolling) return;
        
        if (e.key === 'ArrowRight' && currentIndex < sections.length - 1) {
            scrollToSection(currentIndex + 1);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            scrollToSection(currentIndex - 1);
        }
    });

    // To pause the animation while hovering the projects-outer-container
    document.querySelector(".projects-outer-container").addEventListener("mouseenter", function () {
        projectsContainer.style.animationPlayState = "paused";
    });

    document.querySelector(".projects-outer-container").addEventListener("mouseleave", function () {
        projectsContainer.style.animationPlayState = "running";
    });
});