(function () {
	var pyodide;

	const items = [];
  const multiples = [
		'2',
		'3',
		'4',
		'-2',
		'-3',
		'$x$',
		'$x^2$'
  ];
	items.push(multiples);
	const functions = [
		'$\sin$',
		'$\cos$',
		'$\exp$',
		'$\ln$'
	];
	items.push(functions);
	const arguments = [
		'$(x)$',
		'$(2x)$',
		'$(-2x)$',
		'$(-3x)$',
		'$(3x)$',
		'$(x^2)$',
		'$(x^3)$',
	]
	items.push(arguments);
	const additional = [
		'$+1$',
		'$-1$',
		'$-x$',
		'$-2x^2$',
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

  function init(firstInit = true, groups = 1, duration = 1) {
		var doorCount = 0;
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
        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          arr.push(...items[doorCount]);
          arr.push(...items[doorCount]);
          arr.push(...items[doorCount]);
        }
        pool.push(...shuffle(arr));
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
  }

  async function spin() {
		init();
		await new Promise((resolve) => setTimeout(resolve,  100));
    init(false, 1, 4);

		// const beepInterval = setInterval(() => beep(100, 520, 0.1), 200); // Beep every 200ms

    for (const door of doors) {
      const boxes = door.querySelector('.boxes');
      const duration = parseInt(boxes.style.transitionDuration);
      boxes.style.transform = 'translateY(0)';
      await new Promise((resolve) => setTimeout(resolve, duration * 1000 / 2));
    }
	  calculate("x-cos(x**3)",0,8);

		// clearInterval(beepInterval); // Stop beeping after the spin

  }

  function shuffle([...arr]) {
    let m = arr.length;
    while (10*m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
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
    try {
      let result = pyodide.runPython(`
expr = sp.sympify(${expr})
expr = taylor(expr,${x0},${n})
sp.latex(expr)
			`);
			console.log(result)
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