document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт Gadget Garden загружен');
    
    const API_URL = 'http://localhost:3001/api';
    
    const showFormBtn = document.getElementById('showRequestFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const formContainer = document.getElementById('requestFormContainer');
    const requestForm = document.getElementById('requestForm');
    const formMessage = document.getElementById('formMessage');
    const masterSelect = document.getElementById('masterId');
    
    console.log('showFormBtn:', showFormBtn);
    console.log('formContainer:', formContainer);
    
    if (showFormBtn && formContainer) {
        const newBtn = showFormBtn.cloneNode(true);
        showFormBtn.parentNode.replaceChild(newBtn, showFormBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Кнопка нажата! Форма переключается');
            formContainer.classList.toggle('visible');
            if (formContainer.classList.contains('visible')) {
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    } else {
        console.error('Кнопка или контейнер формы не найдены!');
        console.log('showFormBtn существует?', !!showFormBtn);
        console.log('formContainer существует?', !!formContainer);
    }

    if (cancelFormBtn && formContainer) {
        cancelFormBtn.addEventListener('click', function() {
            formContainer.classList.remove('visible');
            if (requestForm) requestForm.reset();
            if (formMessage) {
                formMessage.className = 'form-message';
                formMessage.style.display = 'none';
                formMessage.textContent = '';
            }
        });
    }
    
    async function loadMastersFromBackend() {
        try {
            const res = await fetch(`${API_URL}/masters`);
            if (!res.ok) throw new Error('Ошибка загрузки');
            const masters = await res.json();
            
            if (masterSelect) {
                masterSelect.innerHTML = '<option value="">— Любой мастер —</option>' + 
                    masters.map(m => `<option value="${m.id}">${m.name} (${m.specialty || 'ремонт'})</option>`).join('');
            }
            console.log('Мастера загружены:', masters);
        } catch(e) {
            console.error('Ошибка загрузки мастеров:', e);
            if (masterSelect) {
                masterSelect.innerHTML = '<option value="">— Любой мастер —</option>';
            }
        }
    }
    
    async function sendRequest(formData) {
        try {
            const res = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                return { success: true, message: '✅ Заявка отправлена! Мастер свяжется с вами в ближайшее время.' };
            } else {
                const error = await res.json();
                return { success: false, message: error.error || '❌ Ошибка при отправке' };
            }
        } catch(e) {
            console.error('Ошибка сети:', e);
            return { success: false, message: '❌ Не удалось соединиться с сервером. Убедитесь, что бэкенд запущен (npm start в папке backend)' };
        }
    }
    
    if (requestForm) {
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const clientName = document.getElementById('clientName').value.trim();
            const clientPhone = document.getElementById('clientPhone').value.trim();
            const deviceType = document.getElementById('deviceType')?.value || '';
            const problemDesc = document.getElementById('problemDesc')?.value || '';
            const masterId = document.getElementById('masterId')?.value || null;
            
            if (!clientName || !clientPhone) {
                if (formMessage) {
                    formMessage.className = 'form-message error';
                    formMessage.textContent = '❌ Пожалуйста, заполните имя и телефон';
                    formMessage.style.display = 'block';
                } else {
                    alert('❌ Пожалуйста, заполните имя и телефон');
                }
                return;
            }
            
            if (formMessage) {
                formMessage.className = 'form-message';
                formMessage.textContent = '⏳ Отправка...';
                formMessage.style.display = 'block';
            }
            
            const payload = {
                client_name: clientName,
                client_phone: clientPhone,
                device_type: deviceType,
                problem_description: problemDesc,
                master_id: masterId
            };
            
            const result = await sendRequest(payload);
            
            if (formMessage) {
                if (result.success) {
                    formMessage.className = 'form-message success';
                    formMessage.textContent = result.message;
                    requestForm.reset();
                    
                    setTimeout(() => {
                        if (formContainer) formContainer.classList.remove('visible');
                        formMessage.style.display = 'none';
                    }, 3000);
                } else {
                    formMessage.className = 'form-message error';
                    formMessage.textContent = result.message;
                }
            } else {
                alert(result.message);
                if (result.success && formContainer) {
                    formContainer.classList.remove('visible');
                    requestForm.reset();
                }
            }
        });
    }
    
    const showMastersBtn = document.getElementById('showMastersBtn');
    if (showMastersBtn) {
        showMastersBtn.addEventListener('click', () => {
            const mastersBlock = document.getElementById('mastersBlock');
            if (mastersBlock) {
                mastersBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    
    // ===== ЗАГРУЖАЕМ МАСТЕРОВ =====
    loadMastersFromBackend();
});