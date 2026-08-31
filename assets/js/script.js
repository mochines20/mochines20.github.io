$(document).ready(function () {

    // Keep the mail modal dismissible even before/after a form submission.
    const mailModal = document.getElementById('mail-modal');
    const dismissMailModal = () => {
        if (!mailModal) return;
        mailModal.classList.remove('is-open');
        mailModal.setAttribute('aria-hidden', 'true');
    };
    document.getElementById('mail-modal-close')?.addEventListener('click', dismissMailModal);
    document.getElementById('mail-modal-later')?.addEventListener('click', dismissMailModal);
    mailModal?.addEventListener('click', (event) => {
        if (event.target === mailModal) dismissMailModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') dismissMailModal();
    });

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // scroll spy
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // Prepare a brief and let the visitor choose Gmail or Outlook.
    $("#contact-form").submit(function (event) {
        event.preventDefault();
        const form = event.currentTarget;
        const values = Object.fromEntries(new FormData(form).entries());
        const subject = `Project Inquiry — ${values.name || 'New Client'}`;
        const body = [
            'Hi John Carlo,', '',
            "I'd like to discuss a project.", '',
            `Name: ${values.name || ''}`,
            `Email: ${values.email || ''}`,
            `Phone: ${values.phone || 'Not provided'}`, '',
            'What I want to build:', values.message || ''
        ].join('\\n');
        const modal = document.getElementById('mail-modal');
        const close = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
        const openComposer = (url) => { window.open(url, '_blank', 'noopener,noreferrer'); form.reset(); close(); };
        document.getElementById('gmail-choice').onclick = () => openComposer(`https://mail.google.com/mail/?view=cm&fs=1&to=johncarlomanalo165@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        document.getElementById('outlook-choice').onclick = () => openComposer(`https://outlook.live.com/mail/0/deeplink/compose?to=johncarlomanalo165@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        document.getElementById('mail-modal-close').onclick = close;
        document.getElementById('mail-modal-later').onclick = close;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('gmail-choice').focus();
    });

});

document.addEventListener('visibilitychange',
    function () {
        if (document.visibilityState === "visible") {
            document.title = "Portfolio | John Carlo Manalo";
            $("#favicon").attr("href", "assets/images/john-carlo-profile.png");
        }
        else {
            document.title = "Come Back To Portfolio";
            $("#favicon").attr("href", "assets/images/favhand.png");
        }
    });


// <!-- typed js effect starts -->
var typed = new Typed(".typing-text", {
    strings: ["Full-Stack Development", "AI / OCR Automation", "RAG Pipelines", "Power BI Analytics", "Enterprise Automation"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
});
// <!-- typed js effect ends -->

async function fetchData(type = "skills") {
    let response
    type === "skills" ?
        response = await fetch("skills.json?v=11", { cache: "no-store" })
        :
        response = await fetch("./projects/projects.json?v=2", { cache: "no-store" })
    const data = await response.json();
    return data;
}

function showSkills(skills) {
    let skillsContainer = document.getElementById("skillsContainer");
    let skillHTML = "";
    skills.forEach(skill => {
        const localIcon = skill.icon && skill.icon.startsWith('./');
        const initials = skill.name.split(/\s+/).map(word => word[0]).join('').slice(0, 3).toUpperCase();
        skillHTML += `
        <div class="bar">
              <div class="info">
                ${localIcon ? `<img src="${skill.icon}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.classList.add('skill-fallback--active');" />` : ''}
                <span class="skill-fallback ${localIcon ? '' : 'skill-fallback--active'}" aria-hidden="true">${initials}</span>
                <span>${skill.name}</span>
              </div>
            </div>`
    });
    skillsContainer.innerHTML = skillHTML;

    // The supplied brand marks include white square backgrounds. Remove only
    // near-white pixels from local skill assets so they sit cleanly on the
    // dark arcade inventory cards without changing the original files.
    skillsContainer.querySelectorAll('img[src^="./assets/images/"]').forEach(image => {
        image.addEventListener('load', () => {
            if (image.dataset.cleaned === 'true') return;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) return;
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            context.drawImage(image, 0, 0);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < pixels.data.length; i += 4) {
                if (pixels.data[i] > 245 && pixels.data[i + 1] > 245 && pixels.data[i + 2] > 245) pixels.data[i + 3] = 0;
            }
            context.putImageData(pixels, 0, 0);
            image.src = canvas.toDataURL('image/png');
            image.dataset.cleaned = 'true';
        }, { once: true });
        if (image.complete) image.dispatchEvent(new Event('load'));
    });
}

function showProjects(projects) {
    let projectsContainer = document.querySelector("#work .box-container");
    let projectHTML = "";
    const featuredOrder = [
        "AP Invoice Processing Automation System",
        "Brand Analytics Dashboard",
        "SMART Tech Pack-to-Costing Approval Tool",
        "Enterprise ITSM Ticketing and Core IT Reporting"
    ];
    projects
        .filter(project => featuredOrder.includes(project.name))
        .sort((a, b) => featuredOrder.indexOf(a.name) - featuredOrder.indexOf(b.name))
        .forEach(project => {
        projectHTML += `
        <div class="box tilt">
      <img draggable="false" src="/assets/images/${project.image}.png" alt="${project.name} interface preview" loading="lazy" decoding="async" />
      <div class="content">
        <div class="tag">
        <h3>${project.name}</h3>
        </div>
        <div class="desc">
          <p>${project.desc}</p>
          <small class="project-status">${project.status || 'Company Project — Internal / Confidential'}</small>
          <div class="btns">
            <a href="${project.links.view}" class="btn"><i class="fas fa-envelope"></i> Discuss Similar Project</a>
          </div>
        </div>
      </div>
    </div>`
    });
    projectsContainer.innerHTML = projectHTML;

    // <!-- tilt js effect starts -->
    if (window.VanillaTilt) VanillaTilt.init(document.querySelectorAll(".tilt"), {
        max: 15,
    });
    // <!-- tilt js effect ends -->

    /* ===== SCROLL REVEAL ANIMATION ===== */
    if (!window.ScrollReveal) return;
    const srtop = ScrollReveal({
        origin: 'top',
        distance: '80px',
        duration: 1000,
        reset: true
    });

    /* SCROLL PROJECTS */
    srtop.reveal('.work .box', { interval: 200 });

}

fetchData().then(data => {
    showSkills(data);
});

fetchData("projects").then(data => {
    showProjects(data);
});

// <!-- tilt js effect starts -->
if (window.VanillaTilt) VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 15,
});
// <!-- tilt js effect ends -->


// pre loader start
// function loader() {
//     document.querySelector('.loader-container').classList.add('fade-out');
// }
// function fadeOut() {
//     setInterval(loader, 500);
// }
// window.onload = fadeOut;
// pre loader end

/* ===== SCROLL REVEAL ANIMATION ===== */
if (window.ScrollReveal) {
const srtop = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 1000,
    reset: true
});

/* SCROLL HOME */
srtop.reveal('.home .content h3', { delay: 200 });
srtop.reveal('.home .content p', { delay: 200 });
srtop.reveal('.home .content .btn', { delay: 200 });

srtop.reveal('.home .image', { delay: 400 });
srtop.reveal('.home .linkedin', { interval: 600 });
srtop.reveal('.home .github', { interval: 800 });
srtop.reveal('.home .twitter', { interval: 1000 });
srtop.reveal('.home .telegram', { interval: 600 });
srtop.reveal('.home .instagram', { interval: 600 });
srtop.reveal('.home .dev', { interval: 600 });

/* SCROLL ABOUT */
srtop.reveal('.about .content h3', { delay: 200 });
srtop.reveal('.about .content .tag', { delay: 200 });
srtop.reveal('.about .content p', { delay: 200 });
srtop.reveal('.about .content .box-container', { delay: 200 });
srtop.reveal('.about .content .resumebtn', { delay: 200 });


/* SCROLL SKILLS */
srtop.reveal('.skills .container', { interval: 200 });
srtop.reveal('.skills .container .bar', { delay: 400 });

/* SCROLL EDUCATION */
srtop.reveal('.education .box', { interval: 200 });

/* SCROLL PROJECTS */
srtop.reveal('.work .box', { interval: 200 });

/* SCROLL EXPERIENCE */
srtop.reveal('.experience .timeline', { delay: 400 });
srtop.reveal('.experience .timeline .container', { interval: 400 });

/* SCROLL CONTACT */
srtop.reveal('.contact .container', { delay: 400 });
srtop.reveal('.contact .container .form-group', { delay: 400 });
}
