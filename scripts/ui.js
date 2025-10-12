// scripts/ui.js

// Function to handle active state of nav items
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll("nav ul li");

  function activateItem(item) {
    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => activateItem(item));

    // Handle keyboard activation
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { // Enter or Space key
        e.preventDefault();
        activateItem(item);
      }
    });
  });
});

// Function to handle section visibility based on nav clicks
const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('nav ul li a');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // prevent default anchor jump

    // Remove 'active' from all links
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Hide all sections
    sections.forEach(section => section.style.display = 'none');

    // Show the target section
    const targetId = link.getAttribute('href').substring(1); // get id from href
    const targetSection = document.getElementById(targetId);
    if(targetSection) targetSection.style.display = 'block';
  });
});


//DOM manipulation for smooth scrolling and active link highlighting
// 1. Select all nav links
const navLinks = document.querySelectorAll('nav ul li a');

// 2. Add click listener to each link
navLinks.forEach(link => {
  link.addEventListener('click', function() {
    // Remove 'active' class from all links
    navLinks.forEach(l => l.classList.remove('active'));

    // Add 'active' class to the clicked link
    this.classList.add('active');

    // Optional: scroll to the section smoothly
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if(targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
