/*const cursorRounded = document.querySelector('.cursor');
const cursorPointed = document.querySelector('.pointed');

document.addEventListener('mousemove', e=>{
  //cursorRounded.setAttribute('style', 'top: '+(e.pageY + 10)+'px; left: '+(e.pageX + 10)+'px');
  cursorPointed.setAttribute('style', 'top: '+(e.pageY - 0)+'px; left: '+(e.pageX + 4)+'px');
});
*/

const options = {
    rootMargin: '0px 0px 0px 0px',
    threshold: 1
  }
const slogan = document.querySelectorAll('.slogan-container-footer');
const bgexplosion = document.querySelector('.bg-explosion');
const observer = new IntersectionObserver(entries =>{
    entries.forEach(entry =>{
        if (entry.intersectionRatio > 0) {
          entry.target.classList.add('slogan-fade');
          //bgexplosion.style.opacity = '0%'
        } else {
          entry.target.classList.remove('slogan-fade');
        }      
    }),
    options
});
slogan.forEach(slogan => {observer.observe(slogan)});

const menuitems = document.querySelectorAll('.side-menu ul li a');

menuitems.forEach(item =>{
  item.addEventListener("click", function(e){
    this.classList.add("active");
  });
});

