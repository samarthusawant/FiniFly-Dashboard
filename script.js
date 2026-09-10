/* =========================================
   FINIFLY FINANCE DASHBOARD
   JAVASCRIPT
========================================= */


/* =========================
   COUNTER ANIMATION
========================= */

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const target = Number(counter.dataset.target);

    let current = 0;

    const duration = 1400;

    const startTime = performance.now();

    function updateCounter(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) / duration,
                1
            );

        const ease =
            1 - Math.pow(1 - progress, 3);

        current = Math.floor(target * ease);

        counter.textContent =
            current.toLocaleString("en-IN");

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }

    }

    requestAnimationFrame(updateCounter);

});


/* =========================
   REVENUE CHART
========================= */

const revenueCanvas =
    document.getElementById("revenueChart");

const revenueCtx =
    revenueCanvas.getContext("2d");


const revenueGradient =
    revenueCtx.createLinearGradient(
        0,
        0,
        0,
        300
    );

revenueGradient.addColorStop(
    0,
    "rgba(108,92,231,0.28)"
);

revenueGradient.addColorStop(
    1,
    "rgba(108,92,231,0.01)"
);


const revenueChart =
    new Chart(
        revenueCtx,
        {
            type: "line",

            data: {

                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep"
                ],

                datasets: [

                    {
                        label: "Revenue",

                        data: [
                            12.4,
                            14.1,
                            13.6,
                            16.8,
                            18.2,
                            19.4,
                            21.1,
                            23.3,
                            24.8
                        ],

                        borderColor:
                            "#6c5ce7",

                        backgroundColor:
                            revenueGradient,

                        borderWidth: 3,

                        pointRadius: 4,

                        pointBackgroundColor:
                            "#ffffff",

                        pointBorderColor:
                            "#6c5ce7",

                        pointBorderWidth: 2,

                        tension: 0.4,

                        fill: true
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        backgroundColor:
                            "#1d1a31",

                        titleColor: "#fff",

                        bodyColor: "#ddd",

                        padding: 12,

                        displayColors: false,

                        callbacks: {

                            label:
                                function(context) {

                                    return (
                                        "Revenue: ₹" +
                                        context.parsed.y +
                                        " Cr"
                                    );

                                }

                        }

                    }

                },

                scales: {

                    x: {

                        grid: {
                            display: false
                        },

                        border: {
                            display: false
                        },

                        ticks: {
                            color: "#999baa",
                            font: {
                                size: 9
                            }
                        }

                    },

                    y: {

                        beginAtZero: true,

                        border: {
                            display: false
                        },

                        grid: {
                            color:
                                "rgba(130,130,150,.08)"
                        },

                        ticks: {

                            color: "#999baa",

                            font: {
                                size: 9
                            },

                            callback:
                                function(value) {

                                    return (
                                        "₹" +
                                        value +
                                        "Cr"
                                    );

                                }

                        }

                    }

                }

            }

        }
    );


/* =========================
   REVENUE PIE CHART
========================= */

const pieCanvas =
    document.getElementById("revenuePie");

const pieCtx =
    pieCanvas.getContext("2d");


const revenuePie =
    new Chart(
        pieCtx,
        {

            type: "doughnut",

            data: {

                labels: [
                    "Investments",
                    "Lending",
                    "Payments",
                    "Advisory"
                ],

                datasets: [

                    {

                        data: [
                            42,
                            28,
                            18,
                            12
                        ],

                        backgroundColor: [
                            "#7160e8",
                            "#19b77a",
                            "#f6a623",
                            "#4e9eea"
                        ],

                        borderWidth: 0,

                        hoverOffset: 5

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "72%",

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    return (
                                        context.label +
                                        ": " +
                                        context.parsed +
                                        "%"
                                    );

                                }

                        }

                    }

                }

            }

        }
    );


/* =========================
   CUSTOMER GROWTH CHART
========================= */

const customerCanvas =
    document.getElementById("customerChart");

const customerCtx =
    customerCanvas.getContext("2d");


const customerGradient =
    customerCtx.createLinearGradient(
        0,
        0,
        0,
        250
    );

customerGradient.addColorStop(
    0,
    "rgba(25,183,122,.25)"
);

customerGradient.addColorStop(
    1,
    "rgba(25,183,122,0)"
);


const customerChart =
    new Chart(
        customerCtx,
        {

            type: "bar",

            data: {

                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep"
                ],

                datasets: [

                    {

                        label:
                            "New Customers",

                        data: [
                            820,
                            940,
                            1080,
                            1210,
                            1360,
                            1480,
                            1690,
                            2110,
                            2431
                        ],

                        backgroundColor:
                            "#19b77a",

                        borderRadius: 6,

                        borderSkipped: false

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        backgroundColor:
                            "#1d1a31",

                        padding: 10

                    }

                },

                scales: {

                    x: {

                        grid: {
                            display: false
                        },

                        ticks: {
                            color: "#999baa",
                            font: {
                                size: 9
                            }
                        },

                        border: {
                            display: false
                        }

                    },

                    y: {

                        beginAtZero: true,

                        grid: {
                            color:
                                "rgba(130,130,150,.08)"
                        },

                        border: {
                            display: false
                        },

                        ticks: {
                            color: "#999baa",
                            font: {
                                size: 9
                            }
                        }

                    }

                }

            }

        }
    );


/* =========================
   DARK MODE
========================= */

const themeToggle =
    document.getElementById("themeToggle");


themeToggle.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");

        const icon =
            themeToggle.querySelector("i");

        if (
            document.body.classList.contains("dark")
        ) {

            icon.classList.remove(
                "fa-moon"
            );

            icon.classList.add(
                "fa-sun"
            );

        } else {

            icon.classList.remove(
                "fa-sun"
            );

            icon.classList.add(
                "fa-moon"
            );

        }

    }
);


/* =========================
   MOBILE SIDEBAR
========================= */

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");


menuBtn.addEventListener(
    "click",
    function() {

        sidebar.classList.toggle("open");

    }
);


/* =========================
   NAVIGATION
========================= */

const navLinks =
    document.querySelectorAll(".nav-link");


navLinks.forEach(link => {

    link.addEventListener(
        "click",
        function() {

            navLinks.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });

            this.classList.add("active");

            if (
                window.innerWidth <= 900
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );

});


/* =========================
   SEARCH
========================= */

const searchInput =
    document.getElementById("searchInput");

const tableRows =
    document.querySelectorAll(
        "#transactionTable tr"
    );


searchInput.addEventListener(
    "input",
    function() {

        const searchValue =
            this.value.toLowerCase().trim();


        tableRows.forEach(row => {

            const rowText =
                row.textContent.toLowerCase();


            if (
                rowText.includes(searchValue)
            ) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });

    }
);


/* =========================
   YEAR FILTER
========================= */

const revenueFilter =
    document.getElementById(
        "revenueFilter"
    );


revenueFilter.addEventListener(
    "change",
    function() {

        const selectedYear =
            this.value;


        let data;


        if (selectedYear === "2026") {

            data = [
                12.4,
                14.1,
                13.6,
                16.8,
                18.2,
                19.4,
                21.1,
                23.3,
                24.8
            ];

        } else if (
            selectedYear === "2025"
        ) {

            data = [
                8.2,
                8.9,
                9.4,
                10.3,
                11.1,
                12.2,
                13.4,
                14.7,
                16.2
            ];

        } else {

            data = [
                5.4,
                5.9,
                6.1,
                6.8,
                7.2,
                7.9,
                8.4,
                9.1,
                10.2
            ];

        }


        revenueChart.data.datasets[0].data =
            data;


        revenueChart.update();

    }
);


/* =========================
   KEYBOARD SEARCH
   CTRL/CMD + K
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            searchInput.focus();

        }

    }
);


/* =========================
   NOTIFICATION
========================= */

const notification =
    document.querySelector(
        ".notification"
    );


notification.addEventListener(
    "click",
    function() {

        alert(
            "You have 3 new financial alerts."
        );

    }
);


/* =========================
   PAGE LOAD EFFECT
========================= */

window.addEventListener(
    "load",
    function() {

        document.body.classList.add(
            "loaded"
        );

    }
);