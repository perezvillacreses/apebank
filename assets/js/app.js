const options = {
    rootMargin: '0px 0px 0px 0px',
    threshold: 1,
    threshold: 1.0
  }
const slogan = document.querySelectorAll('.slogan-container-footer');
const observer = new IntersectionObserver(entries =>{
    entries.forEach(entry =>{
        if (entry.intersectionRatio > 0) {
          entry.target.classList.add('slogan-fade');
        } else {
          entry.target.classList.remove('slogan-fade');
        }      
    }),
    options
});
slogan.forEach(slogan => {observer.observe(slogan)});

const aboutpercentaje = document.documentElement.clientHeight;
function about() {  
  document.body.scrollTop = aboutpercentaje; // For Safari
  document.documentElement.scrollTop = aboutpercentaje; // For Chrome, Firefox, IE and Opera  
}
function tokenomics() {
  document.body.scrollTop = aboutpercentaje * 2; // For Safari
  document.documentElement.scrollTop = aboutpercentaje * 2; // For Chrome, Firefox, IE and Opera
}
function products() {
  document.body.scrollTop = aboutpercentaje * 3; // For Safari
  document.documentElement.scrollTop = aboutpercentaje * 3; // For Chrome, Firefox, IE and Opera
}
