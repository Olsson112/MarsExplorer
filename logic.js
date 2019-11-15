const apiKey = "UumIsThU5kEO1bCVj83FVQAqfkgWlxtQzZW31iWd"
const baseUrl = "https://api.nasa.gov/mars-photos/api/v1/"
const rover = "curiosity"
const selectedCamera = "NAVCAM"

let photoList = []
let timer

async function initSite() {
    try {
        let manifest = await getManifest()
        photoList = filterManifest(manifest, selectedCamera)
        printLoader(false)
        printSliderAndButton()
        let imageList = await getImages(photoList[0]) 
        printImages(imageList)
    } catch(err) {
        console.error(err)
    }
}

function getManifest() {
    let url = new URL(baseUrl + "manifests/" + rover)
    url.search = new URLSearchParams({
        api_key: apiKey
    })
    return makeRequest(url)
}

function getImages(imageDescription) {
    let url = new URL(baseUrl + "rovers/" + rover + "/photos")
    url.search = new URLSearchParams({
        sol: imageDescription.sol,
        camera: selectedCamera,
        api_key: apiKey
    })
    return makeRequest(url)
}

async function makeRequest(url) {
    let response = await fetch(url)
    if(response.status != 200) {
        console.log("ERROR")
        throw new Error(response.status + ": " + response.statusText)
    } else {
        console.log("SUCCESS")
        return await response.json()
    }
}

function filterManifest(manifest, cameraToFilterBy) {
    let photoArray = manifest.photo_manifest.photos

    return photoArray.filter((item) => {
        let navcamExists = false 
        item.cameras.forEach(camera => {
            if(camera == cameraToFilterBy) {
                navcamExists = true
            }
        });
        return navcamExists
    });
}

let onSliderChange = async (event) => {
    printLoader(true)
    var indexToCollect = event.target.value
    document.getElementById("sliderNumber").innerText = indexToCollect
    document.getElementById("imageContainer").innerHTML = ""

    if(timer) {
        clearTimeout(timer)
    }

    timer = setTimeout(async () => {
        try {
            let images = await getImages(photoList[indexToCollect])
            printImages(images)
        } catch(err) {
            console.error(err)
        }
        printLoader(false)
    }, 2000);
}

function printImages(imageList) {    
    let imageContainer = document.getElementById("imageContainer")
    
    imageList.photos.forEach((photoObject) => {

        let imageBox = document.createElement("div")
        imageBox.style.display = "flex"
        imageBox.style.flexDirection = "column"
        imageBox.style.alignItems = "center"
        imageBox.style.padding = "2em"

        let idText = document.createElement("h3")
        idText.innerText = photoObject.id

        let image = document.createElement("img")
        image.style.width = "35em"
        image.src = photoObject.img_src

        console.log(image)

        imageBox.appendChild(idText)
        imageBox.appendChild(image)
        imageContainer.appendChild(imageBox)
    })
}

function printSliderAndButton() {
    let sliderContainer = document.getElementById("sliderContainer")

    let sliderNumber = document.createElement("h2")
    sliderNumber.id = "sliderNumber"
    sliderNumber.innerText = 0 

    let slider = document.createElement("input")
    slider.type = "range"
    slider.max = photoList.length - 1
    slider.style.marginTop = "4em"
    slider.style.width = "80%"
    slider.defaultValue = 0
    slider.oninput = onSliderChange

    sliderContainer.appendChild(sliderNumber)
    sliderContainer.appendChild(slider)
}

function printLoader(show) {
    let loaderContainer = document.getElementById("loaderContainer")

    if(!show) {
        loaderContainer.innerHTML = ""
        return
    }

    if(show && loaderContainer.innerHTML.length) {
        return
    }

    let loaderImage = document.createElement("img")
    loaderImage.src = "./loader.gif"
    loaderImage.style.width = "20em"
    loaderImage.style.height = "auto"

    loaderContainer.appendChild(loaderImage)
}