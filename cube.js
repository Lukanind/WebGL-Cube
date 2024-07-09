var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

var InitDemo = function () {
	console.log('Оно работает!');

	var canvas = document.getElementById('my_canvas');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL не поддерживается, включаем experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Ваш браузер не поддерживает WebGL');
	}

	gl.clearColor(0, 0.85, 0.8, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// Создание шейдеров
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ОШИБКА при компиляции вершинного шейдера!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ОШИБКА при компиляции фрагментного шейдера!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ОШИБКА при линковке программы!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ОШИБКА при валидации программы!', gl.getProgramInfoLog(program));
		return;
	}

	var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Верх
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Лево
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Право
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Перед
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Зад
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Низ
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

	var boxIndices =
	[
		// Верх
		0, 1, 2,
		0, 2, 3,

		// Лево
		5, 4, 6,
		6, 4, 7,

		// Право
		8, 9, 10,
		8, 10, 11,

		// Перед
		13, 12, 14,
		15, 14, 12,

		// Зад
		16, 17, 18,
		16, 18, 19,

		// Низ
		21, 20, 22,
		22, 20, 23
	];

	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Расположение атрибута
		3, // Количество элементов на атрибут
		gl.FLOAT, // Тип элементов
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Размер одной вершины
		0 // Смещение от начала одной вершины до этого атрибута
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Расположение атрибута
		3, // Количество элементов на атрибут
		gl.FLOAT, // Тип элементов
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Размер одной вершины
		3 * Float32Array.BYTES_PER_ELEMENT // Смещение от начала одной вершины до этого атрибута
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// Указать состоянию OpenGL, какая программа должна быть активной
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	// Функция для обновления размера куба
	function updateBoxVertices(width, height, depth) {
		boxVertices = 
		[ // X, Y, Z           R, G, B
			// Верх
			-width, height, -depth,   0.5, 0.5, 0.5,
			-width, height, depth,    0.5, 0.5, 0.5,
			width, height, depth,     0.5, 0.5, 0.5,
			width, height, -depth,    0.5, 0.5, 0.5,

			// Лево
			-width, height, depth,    0.75, 0.25, 0.5,
			-width, -height, depth,   0.75, 0.25, 0.5,
			-width, -height, -depth,  0.75, 0.25, 0.5,
			-width, height, -depth,   0.75, 0.25, 0.5,

			// Право
			width, height, depth,    0.25, 0.25, 0.75,
			width, -height, depth,   0.25, 0.25, 0.75,
			width, -height, -depth,  0.25, 0.25, 0.75,
			width, height, -depth,   0.25, 0.25, 0.75,

			// Перед
			width, height, depth,    1.0, 0.0, 0.15,
			width, -height, depth,    1.0, 0.0, 0.15,
			-width, -height, depth,    1.0, 0.0, 0.15,
			-width, height, depth,    1.0, 0.0, 0.15,

			// Зад
			width, height, -depth,    0.0, 1.0, 0.15,
			width, -height, -depth,    0.0, 1.0, 0.15,
			-width, -height, -depth,    0.0, 1.0, 0.15,
			-width, height, -depth,    0.0, 1.0, 0.15,

			// Низ
			-width, -height, -depth,   0.5, 0.5, 1.0,
			-width, -height, depth,    0.5, 0.5, 1.0,
			width, -height, depth,     0.5, 0.5, 1.0,
			width, -height, -depth,    0.5, 0.5, 1.0,
		];

		gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

		gl.vertexAttribPointer(
			positionAttribLocation, // Расположение атрибута
			3, // Количество элементов на атрибут
			gl.FLOAT, // Тип элементов
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT, // Размер одной вершины
			0 // Смещение от начала одной вершины до этого атрибута
		);
		gl.vertexAttribPointer(
			colorAttribLocation, // Расположение атрибута
			3, // Количество элементов на атрибут
			gl.FLOAT, // Тип элементов
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT, // Размер одной вершины
			3 * Float32Array.BYTES_PER_ELEMENT // Смещение от начала одной вершины до этого атрибута
		);

		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
	}

	// Обработчики событий для ползунков
	document.getElementById('widthSlider').addEventListener('input', function(event) {
		var width = parseFloat(event.target.value);
		var height = parseFloat(document.getElementById('heightSlider').value);
		var depth = parseFloat(document.getElementById('depthSlider').value);
		updateBoxVertices(width, height, depth);
	});

	document.getElementById('heightSlider').addEventListener('input', function(event) {
		var width = parseFloat(document.getElementById('widthSlider').value);
		var height = parseFloat(event.target.value);
		var depth = parseFloat(document.getElementById('depthSlider').value);
		updateBoxVertices(width, height, depth);
	});

	document.getElementById('depthSlider').addEventListener('input', function(event) {
		var width = parseFloat(document.getElementById('widthSlider').value);
		var height = parseFloat(document.getElementById('heightSlider').value);
		var depth = parseFloat(event.target.value);
		updateBoxVertices(width, height, depth);
	});

	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};

window.onload = InitDemo;
