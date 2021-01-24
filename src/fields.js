module.exports = [

	{
		"type": "h2",
		"id": "form-fields"
	},
	{
		"type": "h2",
		"id": "example"
	},
	{
		"type": "table",
		"id": "form-fields",
		"raw": true,
		"data": [
			[
				[
					'button',
					'.button'
				],
				[`
					<button>button</button>
				`]
			],
			[
				[
					'input[type=text]'
				],
				[`<input type="text" placeholder="text" />`]
			],
			[
				[
					'input[type=number]'
				],
				[`<input type="number" placeholder="number" />`]
			],
			[
				[
					'input[type=range]'
				],
				[`<input type="range" class="mr1" placeholder="range" />`]
			],
			[
				[
					'textarea'
				],
				[`<textarea placeholder="textarea" />`]
			],
			[
				[
					'.select',
					'select'
				],
				[`<div class="select"><select><option>a</option><option>b</option><option>c</option></select>`]
			],
			[
				[
					'.color >',
					'input[type=color]'
				],
				[`<div class="color w4em"><input type="color" value="#ffffff" /></div>`]
			],
			[
				[
					'.checkbox >',
					'input[type=checkbox]',
					'span'
				],
				[`<label class="checkbox"><input type="checkbox" /><span /></label>`]
			],
			[
				[
					'.radio >',
					'input[type=radio]',
					'span'
				],
				[`<div class="flex"><label class="radio"><input checked type="radio" name="radio" value="1" /><span /></label><label class="radio"><input type="radio" name="radio" value="2" /><span /></label><label class="radio"><input type="radio" name="radio" value="3" /><span /></label></div>`]
			],
			[
				[
					'.clickable'
				],
				[`<div class="clickable pointer">clickable</div>`]
			]
		]
	}
]