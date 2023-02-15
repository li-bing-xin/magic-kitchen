let pageIndex = 1
let loading = false

let p1 = `I will give you the ingredients for a food, please generate a name for the food using a stories by Andersen, and give me a brief introduction of the story.

ingredients: carrot, lettuce, tomato
Name: The Emperor's Carrot Salad.

Story: This dish is inspired by the story of The Emperor's New Clothes by Hans Christian Andersen. In the story, two weavers promise the Emperor a new suit of clothes that is so fine that it is invisible to those who are unfit for their positions, stupid, or incompetent. The Emperor, believing the weavers, parades around in his "new clothes" until a small child points out that he is actually wearing nothing at all. The Emperor's Carrot Salad is a delicious combination of carrots, lettuce, and tomatoes, representing the Emperor's "new clothes" and the child's honesty.

ingredients:`

let p2 = `I will give you the name of a food, please provide me with the recipe to make it.

name: life is like a beef
Ingredients:
- 2 lbs of ground beef
- 1 onion, diced
- 2 cloves of garlic, minced
- 1 bell pepper, diced
- 1 teaspoon of chili powder
- 1 teaspoon of cumin
- 1 teaspoon of oregano
- 1 teaspoon of paprika
- 1 teaspoon of salt
- 1/2 teaspoon of black pepper
- 1/2 cup of tomato sauce
- 1/4 cup of water
- 1/4 cup of red wine
- 1/4 cup of Worcestershire sauce
- 1/4 cup of ketchup

Instructions:
1. In a large skillet over medium-high heat, cook the ground beef until it is no longer pink.
2. Add the onion, garlic, and bell pepper and cook until the vegetables are softened.
3. Add the chili powder, cumin, oregano, paprika, salt, and black pepper and stir to combine.
4. Add the tomato sauce, water, red wine, Worcestershire sauce, and ketchup and stir to combine.
5. Reduce the heat to low and simmer for 15 minutes, stirring occasionally.
6. Serve over rice or with your favorite sides. Enjoy!

name:`

let p3 = `I will give you a theme for children's dinner, you should give a menu with starter, main course, and desert, each with three courses. all of the names should be inspired by the stories by Andersen.

theme: garden party
Starter:
1. Little Mermaid's Sea Salad
2. Thumbelina's Tiny Tomato Soup
3. Emperor's New Asparagus Spears

Main Course:
1. Princess and the Pea Pancakes
2. Ugly Duckling's Duck Confit
3. Snow Queen's Grilled Salmon

Dessert:
1. Tin Soldier's Apple Pie
2. Swineherd's Chocolate Cake
3. Nightingale's Berry Trifle

theme:`

$(document).ready(() => {
    window.addEventListener('resize', onDogImgResize)
    onDogImgResize()
    bindEvent()
})

function bindEvent() {
    $('.cook').on('click', cook)
    $('.mask').on('click', e => {
        if (e.target.className === 'mask')
            hideResult()
    })
    $('header div').on('click', function () {
        if (loading) return
        $('header div').removeClass('active')
        $(this).addClass('active')
        pageIndex = parseInt($(this)[0].dataset.id)

        $(`.card .content *[class*=info-]`).hide()
        $(`.card .content .info-${pageIndex}`).show()

        $('.materials').val('').attr('placeholder', pageIndex === 1 ? 'Input what you want eat' : pageIndex === 2 ? 'food name' : 'dinner theme')
    })
    $('.materials').on('keydown', e => {
        if (e.keyCode === 13) cook()
    })
    $('.result .close').on('click', () => {
        hideResult()
    })
    $(document).on('click', () => {
        let audio = $('audio')[0]
        if (audio.paused) {
            checkAllImgLoaded();
            audio.play()
        }
    })
}

function onDogImgResize() {
    const {offsetHeight, offsetTop} = $('.dogs-bg')[0]
    $('.color-bg').css('height', offsetHeight * .7 + offsetTop - 62 + 'px')
    setTimeout(() => {
        $('.bone').css('display', 'block')
    })
}

function checkAllImgLoaded() {
    let timer = setInterval(() => {
        if ($('.dogs-bg')[0]?.complete) {
            onDogImgResize()
            clearInterval(timer)
            setTimeout(() => {
                // $('.loading-mask, .dogs-bg-alpha').css('opacity', 0)
                // $('.loading-mask').css('opacity', 0)
                $('.dogs-bg-alpha, .loading-mask').fadeOut({duration: 2000})
                setTimeout(() => {
                    // $('.loading-mask, .dogs-bg-alpha').hide()
                    $('.bone').css('z-index', 10)
                }, 2000)
            }, 200)
        }
    }, 0)
}

let loadingAnimateTimer = null
let count = 0

function cook() {
    if (loading) return
    let content = $('.materials')[0].value
    if (!content.trim()) {
        $('.materials').addClass('animate__swing')
        setTimeout(() => {
            $('.materials').removeClass('animate__swing')
        }, 1000)
        return
    }

    let prompt = (pageIndex === 1 ? p1 : pageIndex === 2 ? p2 : p3) + content + '\n'
    const data = {
        "model": "text-davinci-003",
        "prompt": prompt,
        "temperature": 0.8,
        "max_tokens": 600,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "n": 1
    }
    let urlParams = location.search.slice(1).split('&').map(c => c.split('='))
    let k = urlParams.find(c => c[0] === 'k')?.[1]
    if (k) {
        loading = true
        $('.bone').addClass('animate-bone')
        $('.loading-txt').show()
        let t = 'AI chef is cooking please sit and wait .'
        loadingAnimateTimer = setInterval(() => {
            count++
            count = count % 5
            $('.loading-txt').text(t + ' .'.repeat(count))
        }, 700)
        fetch('https://api.openai.com/v1/completions', {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'authorization': `Bearer ${k}`,
                'content-type': 'application/json'
            }
        }).then(res => res.json()).then(res => {
            if (res.error) {
                alert(res.error?.message || 'Server error.')
                return
            }
            let result = res['choices']?.[0]?.text?.trim() || 'none'
            showResult(result)
        }).catch(err => {
            // alert(err)
        }).finally(() => {
            $('.bone').removeClass('animate-bone')
            loading = false
            $('.loading-txt').hide()
            clearInterval(loadingAnimateTimer)
        })
    } else alert('Invalid openai key!')
}

function showResult(res) {
    if (res.toLowerCase().includes('sorry')) {
        alert(res)
        return
    }
    $('.mask').css('display', 'flex')
    $(document.body).css('overflow', 'hidden')
    setTimeout(() => {
        $(`.result-${pageIndex}`).show().addClass('animate__bounceIn')
        insertResText(res)
        setTimeout(() => {
            $('.result').removeClass('animate__bounceIn')
        }, 1000)
    })
}

function hideResult() {
    $('.mask').fadeOut()
    $('.result').fadeOut()
    $(document.body).css('overflow', 'unset')
}

function insertResText(text) {
    let html = ''
    if (text.startsWith('\n')) text = text.slice(2)
    if (pageIndex === 1) {
        let title1 = 'Name:', title2 = 'Story:'
        let arr = text.split(title1).map(c => c.split(title2)).flat().filter(Boolean).map(c => c.trim())
        html = `
            <div class="t1">Food</div>
            <div  class="text-center d-font" style="margin-bottom: 30px">${arr[0]}</div>
            <div class="t1">Inspiration Story</div>
            <div  class="text-center d-font">${arr[1]}</div>
        `
    }
    if (pageIndex === 2) {
        let title1 = 'Ingredients:', title2 = 'Instructions:'
        let arr = text.split(title1).map(c => c.split(title2)).flat().filter(Boolean).map(c => c.trim())
        html = `
            <div class="t0">Recipe</div>
            <div class="t1">Ingredients</div>
            <div  class="text-center d-font">${arr[0].split('\n').map(c => `<div>${c}</div>`).join('')}</div>
            <div class="t1">Instructions</div>
            <div  class="text-center d-font">${arr[1].split('\n').map(c => `<div>${c}</div>`).join('')}</div>
        `
    }
    if (pageIndex === 3) {
        let title1 = 'Starter:', title2 = 'Main Course:', title3 = 'Dessert:'
        let arr = text.split(title1).map(c => c.split(title2)).flat().filter(Boolean).map(c => c.split(title3)).flat().filter(Boolean).map(c => c.trim())
        html = `
            <div class="t1">Starter</div>
            <div  class="text-center d-font">${arr[0].split('\n').map(c => `<div>${c}</div>`).join('')}</div>
            <div class="t1">Main Course</div>
            <div  class="text-center d-font">${arr[1].split('\n').map(c => `<div>${c}</div>`).join('')}</div>
            <div class="t1">Dessert</div>
            <div class="text-center d-font">${arr[2].split('\n').map(c => `<div>${c}</div>`).join('')}</div>
        `
    }

    $('.mask .result  .dish-name').html(html)
}