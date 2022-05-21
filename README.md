#ApeBank


Particles 
<script src="./particles.js"></script><!--particles main-->
    <script src="./assets/js/app.js"></script>

    <!-- stats.js -->
    <script src="./assets/js/lib/stats.js"></script>
    <script>
    var count_particles, stats, update;
    stats = new Stats;
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    count_particles = document.querySelector('.js-count-particles');
    update = function() {
        stats.begin();
        stats.end();
        if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
        count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
        }
        requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    </script>


    <div class="unlock" id="unlockelement">
        <a href="#" onclick="unlock()" id="unlockbutton">
            click to start the visual experience
        </a>
        <div class="scroll-down"><div class="mouseclick"></div></div>
    </div> 

    <p>MADE BY <img src="./assets/img/ape-emoji.png" height="20px"></img> LOVERS, FOR THE PEOPLE</p>

    //mouse
    <div class="scroll-down"><div class="mouseclick"></div></div>