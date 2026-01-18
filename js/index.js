const input = document.getElementById('input-item');
const addBtn = document.getElementById('add-btn');

const todo = document.querySelector('.column[data-status="todo"] .tasks');
const doing = document.querySelector('.column[data-status="doing"] .tasks');
const done = document.querySelector('.column[data-status="done"] .tasks');

let list = [];

const saveToStorage = () => {
	try {
		localStorage.setItem('list', JSON.stringify(list));
	} catch (e) {
		console.warn('数据异常', e);
		list = [];
	} 
}

const loadToStorage = () => {
	const save = localStorage.getItem('list');
	if (save) {
		try {
			list = JSON.parse(save);
			if (!Array.isArray(list)) {
				throw new Error("Not an array");
			}
			if (list.length > 0) {
				const validStatuses = ['todo', 'doing', 'done'];
				list = list.filter(item => validStatuses.includes(item.currentStatus));
			}
		} catch (e) {
			console.warn('非法注入');
			list = [];
		}
	}
}

const render = () => {
	todo.textContent = '';
	doing.textContent = '';
	done.textContent = '';

	list.forEach(item => {
		const div = document.createElement('div');
		div.classList.add('task');
		div.style.display = 'flex';
		div.dataset.id = item.id;
		div.draggable = true;
		div.addEventListener('dragstart', (e) => {
			e.dataTransfer.setData('text/plain', item.id);
		});

		const span = document.createElement('span');
		span.style.display = 'block';
		span.textContent = item.content;

		const delBtn = document.createElement('button');
		delBtn.style.background = 'none';
		delBtn.textContent = 'x';
		delBtn.style.color = 'red';
		delBtn.style.border = 'none';
		delBtn.style.cursor = 'pointer'

		div.appendChild(span);
		div.appendChild(delBtn);

		if (item.currentStatus === 'todo') {
			todo.appendChild(div);
		} else if (item.currentStatus === 'doing') {
			doing.appendChild(div);
		} else if (item.currentStatus === 'done') {
			done.appendChild(div);
		} else {
			alert('非法注入，请联系后端删除');
		}
	});
}

/** 
 * 移动函数
 * @param { string } id -任务唯一标识符
 * @param { string } newStatus -新的状态
 **/
const move = (id, newStatus) => {
	if (!id) return;
	
	const item = list.find(item => item.id === id);
	if (!item) return;
	
	if (item.currentStatus === newStatus) return;
	
	item.currentStatus = newStatus;
}
/** 
 * 编辑函数
 * @param { HTMLSpanElement } span -双击的元素
 * @param { object } item -对应任务
 */
const startEditing = (span, item) => {
	const inputEdit = document.createElement('input');
	span.replaceWith(inputEdit);
	inputEdit.value = span.textContent;
	
	setTimeout(() => {
		inputEdit.focus();
		// inputEdit.select();这个看具体需求，全选不一定让用户喜爱
	}, 0);
	
	inputEdit.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			finishEditing();
		}
	});
	
	inputEdit.addEventListener('blur', () => {
		finishEditing();
	});
	
	const finishEditing = () => {
		const newValue = inputEdit.value.trim();
		if (newValue) {
			item.content = newValue;
			saveToStorage();
		}
		const newSpan = document.createElement('span');
		newSpan.textContent = item.content;
		inputEdit.replaceWith(newSpan);
	}
}
/** 
 * 允许放入
 * @event { object } --事件对象
 */
const allowDrop = (e) => {
	e.preventDefault();
}


todo.addEventListener('click', (e) => {
	if (e.target.textContent === 'x') {
		const task = e.target.closest('.task');
		const id = task.dataset.id;
		list = list.filter(t => t.id !== id);
		saveToStorage();
		render();
	}
});
todo.addEventListener('dblclick', (e) => {
	if (e.target.matches('span')) {
		const task = e.target.closest('.task');
		if (!task) return;
		const span = e.target;
		const id = task.dataset.id;
		
		const item = list.find(item => item.id === id);
		if (!item) return;
		startEditing(span, item);
	}
});
todo.addEventListener('dragover', allowDrop);
todo.addEventListener('drop', (e) => {
	e.preventDefault();
	const id = e.dataTransfer.getData('text/plain');
	move(id, 'todo');
	
	saveToStorage();
	render();
});


doing.addEventListener('click', (e) => {
	if (e.target.textContent === 'x') {
		const task = e.target.closest('.task');
		const id = task.dataset.id;
		list = list.filter(t => t.id !== id);
		saveToStorage();
		render();
	}
});
doing.addEventListener('dblclick', (e) => {
	if (e.target.matches('span')) {
		const task = e.target.closest('.task');
		if (!task) return;
		const span = e.target;
		const id = task.dataset.id;

		const item = list.find(item => item.id === id);
		if (!item) return;
		startEditing(span, item);
	}
});
doing.addEventListener('dragover', allowDrop);
doing.addEventListener('drop', (e) => {
	e.preventDefault();
	const id = e.dataTransfer.getData('text/plain');
	move(id, 'doing');
	
	saveToStorage();
	render();
});

done.addEventListener('click', (e) => {
	if (e.target.textContent === 'x') {
		const task = e.target.closest('.task');
		const id = task.dataset.id;
		list = list.filter(t => t.id !== id);
		saveToStorage();
		render();
	}
});
done.addEventListener('dblclick', (e) => {
	if (e.target.matches('span')) {
		const task = e.target.closest('.task');
		if (!task) return;
		const span = e.target;
		const id = task.dataset.id;
		
		const item = list.find(item => item.id === id);
		if (!item) return;
		startEditing(span, item);
	}
});
done.addEventListener('dragover', allowDrop);
done.addEventListener('drop', (e) => {
	e.preventDefault();
	const id = e.dataTransfer.getData('text/plain');
	move(id, 'done');
	
	saveToStorage();
	render();
});

input.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		addTask();
		saveToStorage();
		render();
	}
});
addBtn.addEventListener('click', () => {
	addTask();
	saveToStorage();
	render();
});

const addTask = () => {
	const text = input.value.trim();
	if (text) {
		list.push({
			id: String(Date.now()),
			content: text,
			currentStatus: 'todo'
		});
		input.value = '';
	} else {
		alert('请输入任务项');
	}
}

loadToStorage();
render();