(function () {
	var pyodide;

	const items = [];
  const multiples = [
		['2',	'2'],
		['3',	'3'],
		['4',	'4'],
		['-2',	'-2'],
		['-3',	'-3'],
		['-4',	'-4'],
		['x',	'x'],
		['x**2',	'x^2'],
		['x**3',	'x^3'],
		['2*x',	'2x'],
		['3*x**2',		'3x^2'],
  ];
	items.push(multiples);
	const functions = [
		['sin',	'\\sin'],
		['cos',	'\\cos'],
		['exp',	'\\exp'],
		['ln',	'\\ln'],
	];
	items.push(functions);
	const arguments = [
		['+x','x'],
		['+2*x','2x'],
		['-2*x','-2x'],
		['-3*x','-3x'],
		['+3*x','3x'],
		['+x**2','x^2'],
		['-x**3','-x^3'],
	]
	items.push(arguments);
	const additional = [
		['+1', '+\\;1'],
		['-1', '-1\\;'],
		['+x', '+\\;x'],
		['-2*x**2', '-\\;2x^2'],
	]
	items.push(additional);

  const doors = document.querySelectorAll('.door');

  document.querySelector('#spinner').addEventListener('click', spin);

	const audioContext = new (window.AudioContext || window.webkitAudioContext)();

	function beep(duration, frequency = 520, volume = 1, type = 'sine') {
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.value = frequency;
			gainNode.gain.value = volume;
			oscillator.type = type;
			oscillator.start();

			setTimeout(() => {
					oscillator.stop();
			}, duration);
	}

	function replaceCharacter(str, index, char) {
    if (index >= 0 && index < str.length) { // Check if index is within the string
        let arr = str.split(''); // Convert string to array
        arr[index] = char; // Replace character
        return arr.join(''); // Convert array back to string
    } else {
        return str; // Return original string if index is out of bounds
    }
	}

  function init(firstInit = true, groups = 1, duration = 1) {
		var doorCount = 0;
		var lastSympy = "";
		var sympyArray = [];
    for (const door of doors) {
      if (firstInit) {
        door.dataset.spinned = '0';
      } else if (door.dataset.spinned === '1') {
        return;
      }

      const boxes = door.querySelector('.boxes');
      const boxesClone = boxes.cloneNode(false);
      const pool = ['❓'];

      if (!firstInit) {
        const arr = [];

				shuffle(items[doorCount]);
				if (lastSympy == "ln") {
					thisItemSympy = "1+" + items[doorCount][items[doorCount].length - 1][0];
					console.log("log sympy = " + thisItemSympy);

					latexItems = (items[doorCount]).map(x=>{
						var s = x[1];
						if (s[0]=="-") {
							return `$(1 ${s})$`;
						} else {
						return `$(1 + ${s})$`;
						}
					})
				} else {
					thisItemSympy = items[doorCount][items[doorCount].length - 1][0];
					console.log("sympy = " + thisItemSympy);
					latexItems = (items[doorCount]).map(x=>doorCount==2?`$(${x[1]})$`:`$ ${x[1]}$`);
				}

        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          arr.push(...latexItems);
        }

				pool.push(...arr);
				sympyArray.push(thisItemSympy);
				lastSympy = thisItemSympy;
				doorCount += 1;

        boxesClone.addEventListener(
          'transitionstart',
          function () {
            door.dataset.spinned = '1';
            this.querySelectorAll('.box').forEach((box) => {
              box.style.filter = 'blur(1px)';
            });
          },
          { once: true }
        );

        boxesClone.addEventListener(
          'transitionend',
          function () {
            this.querySelectorAll('.box').forEach((box, index) => {
              box.style.filter = 'blur(0)';
              if (index > 0) this.removeChild(box);
            });
          },
          { once: true }
        );
      }

			console.log("pool tail = "+pool[pool.length-1]);
      for (let i = pool.length - 1; i >= 0; i--) {
        const box = document.createElement('div');
        box.classList.add('box');
        box.style.width = door.clientWidth + 'px';
        box.style.height = door.clientHeight + 'px';
        box.innerHTML = pool[i];
        boxesClone.appendChild(box);
				MathJax.typeset([box]);  // Typeset only the new box
      }
      boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
      boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1)}px)`;
      door.replaceChild(boxesClone, boxes);
    }
		if (sympyArray.length > 0) {
			sympyString = `${sympyArray[0]}*${sympyArray[1]}(${sympyArray[2]})+${sympyArray[3]}`;
			getAnswer(sympyString);
		}
  }

	async function getAnswer(sympyString) {
		console.log("solving sympystring = ",sympyString);
		calculate(sympyString,0,16);
	}

  async function spin() {
		init();
		await new Promise((resolve) => setTimeout(resolve,  100));
    init(false, 4, 4);

		// const beepInterval = setInterval(() => beep(100, 520, 0.1), 200); // Beep every 200ms

    for (const door of doors) {
      const boxes = door.querySelector('.boxes');
      const duration = parseInt(boxes.style.transitionDuration);
      boxes.style.transform = 'translateY(0)';
      await new Promise((resolve) => setTimeout(resolve, duration * 1000 / 2));
    }
		// clearInterval(beepInterval); // Stop beeping after the spin

  }

	function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        let j = Math.floor(Math.random() * (i + 1));

        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

	async function loadPyodideAndPackages() {
    let pyodide = await loadPyodide();
    await pyodide.loadPackage(['sympy']);  // Load specific packages if necessary
    return pyodide;
  }

	async function setup() {
    pyodide = await loadPyodideAndPackages();
		try {
			let result = pyodide.runPython(`
import sympy as sp
from sympy import sin, cos, exp, ln

x = sp.var('x')
# Factorial function
def factorial(n):
    if n <= 0:
        return 1
    else:
        return n*factorial(n-1)

# Taylor approximation at x0 of the function 'function'
def taylor(function,x0,n):
    i = 0
    p = 0
    while i <= n:
        p = p + (function.diff(x,i).subs(x,x0))/(factorial(i))*(x-x0)**i
        i += 1
    return p
			`);
			console.log("Sympy loaded successfully")
		} catch (e) {
			console.error("Error loading sympy: " + e.message);
		}
	}

  async function calculate(expr,x0,n) {
		console.log("Calculating " + expr)
		let body = `
e1 = sp.sympify(${expr})
e2 = sp.series(e1,x,${x0},n=${n})
sp.latex(e2)
					`
		console.log(body);
    try {
      let result = pyodide.runPython(body);
      console.log('Result:', result.toString());
			placeholder = document.getElementById('placeholder');
			answer = document.getElementsByClassName('answer');
			placeholder.innerHTML = `\\(${result.toString()}\\)`;
			MathJax.typeset([answer]);
    } catch (err) {
      console.error('Error:', err);
    }
  }

	setup().then( () => {
		calculate("sin(x)",0,7);
		init();
	});
})();