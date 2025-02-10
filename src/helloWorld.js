const main = document.getElementById("main")

function hello(){
    const sectionHello = document.createElement(section)
    sectionHello.textContent = "Hello world"
    main.appendChild(sectionHello)
}