const API_BASE = 'http://localhost:8081/api';
// TianAPI 密钥 - 需要替换为你自己的API密钥
const TIANAPI_KEY = '183fe84f9227921e809720efddbf6615';

const state = {
    ingredients: [],
    selectedIngredientIds: new Set(),
    currentCategory: 'all',
    matchedRecipes: [],
    memos: [],
    onlineRecipes: [],
    favorites: [],
    favoriteIds: new Set()
};

const ingredientEmojis = {
    '猪肉': '🥩', '五花肉': '🥓', '排骨': '🍖', '牛肉': '🥩', '鸡肉': '🍗', '鸡腿': '🍗',
    '白菜': '🥬', '酸菜': '🥬', '土豆': '🥔', '茄子': '茄子', '青椒': '🫑', '豆角': '🫛',
    '西红柿': '🍅', '黄瓜': '🥒', '菠菜': '🥬', '韭菜': '🌿', '豆芽': '🌱',
    '豆腐': '🧈', '冻豆腐': '🧊', '干豆腐': '📜', '粉丝': '🍜', '粉条': '🍜',
    '木耳': '🍄', '香菇': '🍄', '榛蘑': '🍄',
    '鸡蛋': '🥚',
    '葱': '🧅', '生姜': '🫚', '大蒜': '🧄', '酱油': '🫗', '盐': '🧂', '糖': '🍬',
    '醋': '🍶', '料酒': '🍶', '大酱': '🫙', '花椒': '🌶️', '八角': '⭐', '淀粉': '🥣', '香油': '🫗'
};

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = `toast ${type}`;
    }, 2000);
}

async function api(url, options = {}) {
    try {
        const res = await fetch(API_BASE + url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('API Error:', err);
        showToast('网络错误，请检查后端是否启动', 'error');
        return { code: 500, msg: '网络错误' };
    }
}

// 加载冰箱食材
async function loadIngredients() {
    const res = await api('/ingredient/list');
    if (res.code === 200) {
        state.ingredients = res.data;
        renderCategories();
        renderIngredients();
    }
}

// 加载买菜备忘录
async function loadMemos() {
    const res = await api('/memo/list');
    if (res.code === 200) {
        state.memos = res.data;
        renderMemos();
    }
}

function getCategories() {
    const categories = [...new Set(state.ingredients.map(i => i.category))];
    return ['all', ...categories];
}

const categoryEmojis = {
    'all': '📋 全部',
    '蛋类': '🥚 蛋类',
    '蔬菜': '🥬 蔬菜',
    '肉类': '🥩 肉类',
    '豆制品': '🧈 豆制品',
    '菌类': '🍄 菌类',
    '调料': '🧂 调料'
};

function renderCategories() {
    const tabs = document.getElementById('categoryTabs');
    const categories = getCategories();
    tabs.innerHTML = categories.map(cat => `
        <button class="category-tab ${state.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
            ${categoryEmojis[cat] || cat}
        </button>
    `).join('');
    tabs.querySelectorAll('.category-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentCategory = btn.dataset.category;
            renderCategories();
            renderIngredients();
        });
    });
}

function renderIngredients() {
    const grid = document.getElementById('ingredientGrid');
    const filtered = state.currentCategory === 'all'
        ? state.ingredients
        : state.ingredients.filter(i => i.category === state.currentCategory);
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="padding:40px;">
                <div class="empty-icon">🥗</div>
                <p>冰箱里还没有食材</p>
                <p class="empty-tip">点击右上角「+ 添加食材」开始添加吧！</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map((item, index) => {
        const expireInfo = getExpireStatus(item.expireDate);
        const expireClass = expireInfo ? `expire-${expireInfo.status}` : '';
        return `
        <div class="ingredient-card ${state.selectedIngredientIds.has(item.id) ? 'selected' : ''} ${expireClass}" 
             data-id="${item.id}" style="animation-delay: ${index * 0.02}s">
            <button class="ingredient-delete" data-delete="${item.id}" title="删除食材">×</button>
            <div class="ingredient-emoji">${ingredientEmojis[item.name] || '🍽️'}</div>
            <div class="ingredient-name">${item.name}</div>
            <div class="ingredient-category">${item.category}</div>
            ${item.quantity ? `<div class="ingredient-quantity">${item.quantity}</div>` : ''}
            ${expireInfo ? `<div class="ingredient-expire ${expireInfo.status}">${expireInfo.text}</div>` : ''}
        </div>
    `;
    }).join('');
    
    grid.querySelectorAll('.ingredient-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('ingredient-delete')) return;
            const id = parseInt(card.dataset.id);
            if (state.selectedIngredientIds.has(id)) {
                state.selectedIngredientIds.delete(id);
            } else {
                state.selectedIngredientIds.add(id);
            }
            updateSelectedCount();
            renderIngredients();
        });
    });
    
    grid.querySelectorAll('.ingredient-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.delete);
            deleteIngredient(id);
        });
    });
}

function updateSelectedCount() {
    const count = state.selectedIngredientIds.size;
    document.getElementById('selectedCount').textContent = count;
    document.getElementById('matchBtn').disabled = count === 0;
}

async function addIngredient() {
    const name = document.getElementById('newIngredientName').value.trim();
    const category = document.getElementById('newIngredientCategory').value;
    const quantity = document.getElementById('newIngredientQuantity').value.trim();
    const expireDate = document.getElementById('newIngredientExpireDate').value;
    
    if (!name) {
        showToast('请输入食材名称', 'error');
        return;
    }
    
    const body = { name, category };
    if (quantity) body.quantity = quantity;
    if (expireDate) body.expireDate = expireDate;
    
    const res = await api('/ingredient', {
        method: 'POST',
        body: JSON.stringify(body)
    });
    
    if (res.code === 200) {
        showToast('添加成功！');
        document.getElementById('newIngredientName').value = '';
        document.getElementById('newIngredientQuantity').value = '';
        document.getElementById('newIngredientExpireDate').value = '';
        document.getElementById('addIngredientModal').style.display = 'none';
        loadIngredients();
    } else {
        showToast(res.msg || '添加失败', 'error');
    }
}

async function deleteIngredient(id) {
    if (!confirm('确定要删除这个食材吗？')) return;
    
    const res = await api(`/ingredient/${id}`, {
        method: 'DELETE'
    });
    
    if (res.code === 200) {
        showToast('删除成功！');
        state.selectedIngredientIds.delete(id);
        updateSelectedCount();
        loadIngredients();
    } else {
        showToast(res.msg || '删除失败', 'error');
    }
}

// 匹配食谱（本地数据库 + 联网搜索）
async function matchRecipes() {
    if (state.selectedIngredientIds.size === 0) return;
    
    showToast('正在搜索食谱...');
    
    // 1. 先搜索本地数据库
    const localRes = await api('/recipe/match', {
        method: 'POST',
        body: JSON.stringify({ ingredientIds: [...state.selectedIngredientIds] })
    });
    
    let localRecipes = [];
    if (localRes.code === 200) {
        localRecipes = localRes.data.map(r => ({ ...r, source: 'local' }));
    }
    
    // 2. 联网搜索食谱（使用选中的食材名称）
    const selectedNames = state.ingredients
        .filter(i => state.selectedIngredientIds.has(i.id))
        .map(i => i.name);
    
    let onlineRecipes = [];
    for (const name of selectedNames.slice(0, 3)) { // 只搜索前3个食材
        const onlineRes = await searchOnlineRecipes(name);
        if (onlineRes.length > 0) {
            onlineRecipes = onlineRecipes.concat(onlineRes.map(r => ({ ...r, source: 'online' })));
        }
    }
    
    // 合并结果
    state.matchedRecipes = [...localRecipes, ...onlineRecipes];
    renderRecipes();
    switchPage('recipes');
    
    if (state.matchedRecipes.length > 0) {
        showToast(`找到 ${state.matchedRecipes.length} 道食谱！`);
    } else {
        showToast('没有找到匹配的食谱', 'error');
    }
}

// 联网搜索食谱（TianAPI）
async function searchOnlineRecipes(keyword) {
    if (TIANAPI_KEY === 'YOUR_TIANAPI_KEY') {
        // 如果没有配置API密钥，返回模拟数据
        return getMockOnlineRecipes(keyword);
    }
    
    try {
        const res = await fetch(`https://apis.tianapi.com/caipu/index?key=${TIANAPI_KEY}&word=${encodeURIComponent(keyword)}&num=5`);
        const data = await res.json();
        
        if (data.code === 200 && data.result && data.result.list) {
            return data.result.list.map(item => ({
                recipeId: `online_${item.id}`,
                title: item.cp_name,
                description: item.texing || '',
                difficulty: '中等',
                cookTime: '30分钟',
                matchRate: 0.5,
                matchCount: 1,
                totalIngredientCount: 5,
                matchedIngredients: [keyword],
                missingIngredients: item.yuanliao ? item.yuanliao.split('；').slice(1) : [],
                steps: item.zuofa,
                source: 'online'
            }));
        }
    } catch (err) {
        console.error('TianAPI Error:', err);
    }
    return [];
}

// 模拟联网搜索结果（API未配置时使用）
function getMockOnlineRecipes(keyword) {
    const mockData = {
        '猪肉': [
            { id: 'o1', name: '红烧肉', desc: '经典家常菜，肥而不腻', steps: '1.五花肉切块焯水\n2.炒糖色\n3.加酱油料酒炖煮' },
            { id: 'o2', name: '糖醋里脊', desc: '酸甜可口，外酥里嫩', steps: '1.里脊切条腌制\n2.裹淀粉炸制\n3.淋上糖醋汁' }
        ],
        '鸡肉': [
            { id: 'o3', name: '宫保鸡丁', desc: '川菜经典，麻辣鲜香', steps: '1.鸡丁切条腌制\n2.炒花生米\n3.翻炒加酱料' },
            { id: 'o4', name: '可乐鸡翅', desc: '简单易做，香甜可口', steps: '1.鸡翅煎至金黄\n2.倒入可乐\n3.收汁装盘' }
        ],
        '鸡蛋': [
            { id: 'o5', name: '番茄炒蛋', desc: '国民家常菜，酸甜下饭', steps: '1.鸡蛋打散炒熟\n2.番茄切块翻炒\n3.混合调味' },
            { id: 'o6', name: '蒸蛋羹', desc: '嫩滑营养，老少皆宜', steps: '1.鸡蛋加水搅匀\n2.过滤去泡沫\n3.蒸8分钟' }
        ],
        '白菜': [
            { id: 'o7', name: '醋溜白菜', desc: '酸爽开胃，简单快手', steps: '1.白菜切段\n2.热锅爆香\n3.加醋快炒' }
        ],
        '土豆': [
            { id: 'o8', name: '土豆丝', desc: '清脆爽口，家常必备', steps: '1.土豆切丝泡水\n2.热油爆香\n3.大火快炒' },
            { id: 'o9', name: '土豆泥', desc: '绵软香甜，小朋友最爱', steps: '1.土豆蒸熟\n2.压成泥状\n3.加牛奶黄油' }
        ]
    };
    
    const recipes = mockData[keyword] || [
        { id: 'o10', name: `${keyword}料理`, desc: '美味家常菜', steps: '根据食材自由发挥，做出属于你的美味！' }
    ];
    
    return recipes.map(item => ({
        recipeId: `online_${item.id}`,
        title: item.name,
        description: item.desc,
        difficulty: '简单',
        cookTime: '20分钟',
        matchRate: 0.6,
        matchCount: 1,
        totalIngredientCount: 3,
        matchedIngredients: [keyword],
        missingIngredients: ['其他配料'],
        steps: item.steps,
        source: 'online'
    }));
}

function getDifficultyClass(difficulty) {
    if (difficulty === '简单') return 'easy';
    if (difficulty === '困难') return 'hard';
    return '';
}

// 获取过期状态
function getExpireStatus(expireDate) {
    if (!expireDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expire = new Date(expireDate);
    expire.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expire - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', text: '已过期', days: diffDays };
    if (diffDays <= 2) return { status: 'danger', text: `还有${diffDays}天过期`, days: diffDays };
    if (diffDays <= 5) return { status: 'warning', text: `还有${diffDays}天过期`, days: diffDays };
    return null;
}

// 格式化日期显示
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getSourceLabel(source) {
    return source === 'online' ? '🌐 网络' : '📚 本地';
}

function renderRecipes() {
    const container = document.getElementById('recipeResult');
    
    if (state.matchedRecipes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">😅</div>
                <p>没有找到匹配的食谱</p>
                <p class="empty-tip">试试多选几种食材吧！</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="recipe-list">
            ${state.matchedRecipes.map((recipe, index) => {
                const isFav = recipe.source === 'local' && state.favoriteIds.has(recipe.recipeId);
                return `
                <div class="recipe-card recipe-card-noimg" data-id="${recipe.recipeId}" data-source="${recipe.source}" style="animation-delay: ${index * 0.05}s">
                    <div class="recipe-info">
                        <div class="recipe-card-header">
                            <div class="recipe-title">${recipe.title} <span class="source-tag">${getSourceLabel(recipe.source)}</span></div>
                            ${recipe.source === 'local' ? `
                            <button class="favorite-btn ${isFav ? 'active' : ''}" data-fav="${recipe.recipeId}" data-title="${recipe.title}">
                                ${isFav ? '⭐' : '☆'}
                            </button>
                            ` : ''}
                        </div>
                        <div class="recipe-desc">${recipe.description || ''}</div>
                        <div class="recipe-meta">
                            <span class="meta-tag meta-difficulty ${getDifficultyClass(recipe.difficulty)}">
                                ⭐ ${recipe.difficulty || '中等'}
                            </span>
                            <span class="meta-tag meta-time">
                                ⏱️ ${recipe.cookTime || '30分钟'}
                            </span>
                            ${recipe.calories ? `
                            <span class="meta-tag" style="background:#fff5f5;color:#e53e3e;">
                                🔥 ${recipe.calories}千卡
                            </span>
                            ` : ''}
                        </div>
                        <div class="match-rate">
                            <span style="font-size:13px;color:#718096;">匹配度</span>
                            <div class="match-bar">
                                <div class="match-fill" data-width="${recipe.matchRate * 100}"></div>
                            </div>
                            <span class="match-text">${Math.round(recipe.matchRate * 100)}%</span>
                        </div>
                        ${recipe.source === 'local' ? `
                        <div style="margin-top:8px;font-size:12px;color:#a0aec0;">
                            ${recipe.matchCount}/${recipe.totalIngredientCount} 种食材匹配
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            }).join('')}
        </div>
    `;
    
    setTimeout(() => {
        document.querySelectorAll('.match-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 100);
    
    container.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) return;
            const id = card.dataset.id;
            const source = card.dataset.source;
            showRecipeDetail(id, source);
        });
    });
    
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const recipeId = parseInt(btn.dataset.fav);
            const title = btn.dataset.title;
            toggleFavorite(recipeId, title);
        });
    });
}

async function showRecipeDetail(id, source) {
    if (source === 'online') {
        // 网络食谱直接从state中获取
        const recipe = state.matchedRecipes.find(r => r.recipeId === id);
        if (recipe) {
            document.getElementById('recipeDetail').innerHTML = `
                <div class="recipe-detail-body recipe-detail-noimg">
                    <div class="recipe-card-header">
                        <h2 class="recipe-detail-title">${recipe.title} <span class="source-tag">🌐 网络搜索</span></h2>
                    </div>
                    <p class="recipe-detail-desc">${recipe.description || ''}</p>
                    
                    <div class="recipe-meta" style="margin-bottom:20px;">
                        <span class="meta-tag meta-difficulty ${getDifficultyClass(recipe.difficulty)}">
                            ⭐ ${recipe.difficulty || '中等'}
                        </span>
                        <span class="meta-tag meta-time">
                            ⏱️ ${recipe.cookTime || '30分钟'}
                        </span>
                    </div>
                    
                    ${recipe.matchedIngredients ? `
                    <div class="recipe-detail-section">
                        <h4>🥬 食材匹配</h4>
                        <div class="ingredient-tags">
                            ${recipe.matchedIngredients.map(i => `<span class="ingredient-tag">✓ ${i}</span>`).join('')}
                            ${recipe.missingIngredients ? recipe.missingIngredients.map(i => `<span class="ingredient-tag missing">✗ ${i}</span>`).join('') : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="recipe-detail-section">
                        <h4>📝 烹饪步骤</h4>
                        <div class="steps-list">${recipe.steps || ''}</div>
                    </div>
                    
                    <div class="recipe-actions">
                        <button class="btn-primary" onclick="addToMemoFromRecipe('${recipe.missingIngredients ? recipe.missingIngredients.join(',') : ''}')">
                            📝 添加缺失食材到备忘录
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('recipeModal').style.display = 'block';
        }
    } else {
        // 本地食谱调用API
        const res = await api(`/recipe/${parseInt(id.replace('online_', ''))}`);
        if (res.code === 200) {
            const recipe = res.data;
            const match = state.matchedRecipes.find(r => r.recipeId === parseInt(id)) || {};
            const isFav = state.favoriteIds.has(recipe.id);
            
            let matchedHtml = '';
            let missingHtml = '';
            if (match.matchedIngredients) {
                matchedHtml = match.matchedIngredients.map(i => `<span class="ingredient-tag">✓ ${i}</span>`).join('');
            }
            if (match.missingIngredients) {
                missingHtml = match.missingIngredients.map(i => `<span class="ingredient-tag missing">✗ ${i}</span>`).join('');
            }
            
            const nutritionHtml = recipe.calories ? `
                <div class="recipe-detail-section">
                    <h4>🔥 营养成分（每份）</h4>
                    <div class="nutrition-info">
                        <div class="nutrition-item">
                            <div class="nutrition-value calories">${recipe.calories}</div>
                            <div class="nutrition-label">千卡</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value protein">${recipe.protein || 0}g</div>
                            <div class="nutrition-label">蛋白质</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value fat">${recipe.fat || 0}g</div>
                            <div class="nutrition-label">脂肪</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value carbs">${recipe.carbs || 0}g</div>
                            <div class="nutrition-label">碳水</div>
                        </div>
                    </div>
                </div>
            ` : '';
            
            document.getElementById('recipeDetail').innerHTML = `
                <div class="recipe-detail-body recipe-detail-noimg">
                    <div class="recipe-card-header">
                        <h2 class="recipe-detail-title">${recipe.title} <span class="source-tag">📚 本地食谱</span></h2>
                        <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${recipe.id}, '${recipe.title}')">
                            ${isFav ? '⭐' : '☆'}
                        </button>
                    </div>
                    <p class="recipe-detail-desc">${recipe.description || ''}</p>
                    
                    <div class="recipe-meta" style="margin-bottom:20px;">
                        <span class="meta-tag meta-difficulty ${getDifficultyClass(recipe.difficulty)}">
                            ⭐ ${recipe.difficulty || '中等'}
                        </span>
                        <span class="meta-tag meta-time">
                            ⏱️ ${recipe.cookTime || '30分钟'}
                        </span>
                        ${recipe.calories ? `
                        <span class="meta-tag" style="background:#fff5f5;color:#e53e3e;">
                            🔥 ${recipe.calories}千卡
                        </span>
                        ` : ''}
                    </div>
                    
                    ${match.matchedIngredients ? `
                    <div class="recipe-detail-section">
                        <h4>🥬 食材匹配</h4>
                        <div class="ingredient-tags">
                            ${matchedHtml}
                            ${missingHtml}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${nutritionHtml}
                    
                    <div class="recipe-detail-section">
                        <h4>📝 烹饪步骤</h4>
                        <div class="steps-list">${recipe.steps || ''}</div>
                    </div>
                    
                    <div class="recipe-actions">
                        ${match.missingIngredients && match.missingIngredients.length > 0 ? `
                        <button class="btn-primary" onclick="addToMemoFromRecipe('${match.missingIngredients.join(',')}')">
                            📝 添加缺失食材到备忘录
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;
            document.getElementById('recipeModal').style.display = 'block';
        }
    }
}

// 从食谱详情添加缺失食材到备忘录
function addToMemoFromRecipe(ingredients) {
    if (!ingredients) {
        showToast('没有缺失的食材', 'error');
        return;
    }
    const list = ingredients.split(',');
    list.forEach(name => {
        if (name.trim()) {
            addMemo(name.trim());
        }
    });
    showToast(`已添加 ${list.length} 种食材到备忘录！`);
    document.getElementById('recipeModal').style.display = 'none';
}

// ========== 收藏功能 ==========

async function loadFavorites() {
    const res = await api('/favorite/list');
    if (res.code === 200) {
        state.favorites = res.data;
        state.favoriteIds = new Set(res.data.map(f => f.recipeId));
        renderFavorites();
    }
}

async function toggleFavorite(recipeId, recipeTitle) {
    const isFav = state.favoriteIds.has(recipeId);
    
    if (isFav) {
        const res = await api(`/favorite/${recipeId}`, { method: 'DELETE' });
        if (res.code === 200) {
            state.favoriteIds.delete(recipeId);
            state.favorites = state.favorites.filter(f => f.recipeId !== recipeId);
            showToast('已取消收藏');
        }
    } else {
        const res = await api('/favorite', {
            method: 'POST',
            body: JSON.stringify({ recipeId, recipeTitle })
        });
        if (res.code === 200) {
            state.favoriteIds.add(recipeId);
            showToast('收藏成功！');
        } else {
            showToast(res.msg || '收藏失败', 'error');
        }
    }
    
    renderRecipes();
    renderFavorites();
}

function renderFavorites() {
    const container = document.getElementById('favoriteList');
    
    if (!container) return;
    
    if (state.favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💝</div>
                <p>还没有收藏的食谱</p>
                <p class="empty-tip">看到喜欢的食谱，点击收藏按钮吧！</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="recipe-list">
            ${state.favorites.map((fav, index) => `
                <div class="recipe-card recipe-card-noimg" data-id="${fav.recipeId}" data-source="local" style="animation-delay: ${index * 0.05}s">
                    <div class="recipe-info">
                        <div class="recipe-card-header">
                            <div class="recipe-title">${fav.recipeTitle}</div>
                            <button class="favorite-btn active" data-fav="${fav.recipeId}" data-title="${fav.recipeTitle}">⭐</button>
                        </div>
                        <div class="recipe-desc">${fav.recipeDesc || ''}</div>
                        <div class="recipe-meta">
                            <span class="meta-tag meta-difficulty ${getDifficultyClass(fav.difficulty)}">
                                ⭐ ${fav.difficulty || '中等'}
                            </span>
                            <span class="meta-tag meta-time">
                                ⏱️ ${fav.cookTime || '30分钟'}
                            </span>
                            ${fav.calories ? `
                            <span class="meta-tag" style="background:#fff5f5;color:#e53e3e;">
                                🔥 ${fav.calories}千卡
                            </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) return;
            const id = card.dataset.id;
            showRecipeDetail(id, 'local');
        });
    });
    
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const recipeId = parseInt(btn.dataset.fav);
            const title = btn.dataset.title;
            toggleFavorite(recipeId, title);
        });
    });
}

// ========== 买菜备忘录功能 ==========

function renderMemos() {
    const list = document.getElementById('memoList');
    
    if (state.memos.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding:40px;">
                <div class="empty-icon">📝</div>
                <p>备忘录是空的</p>
                <p class="empty-tip">添加明天需要买的食材吧！</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = state.memos.map((item, index) => `
        <div class="memo-item ${item.completed ? 'completed' : ''}" data-id="${item.id}" style="animation-delay: ${index * 0.05}s">
            <input type="checkbox" class="memo-checkbox" ${item.completed ? 'checked' : ''} data-id="${item.id}">
            <span class="memo-text">${item.content}</span>
            <button class="memo-delete" data-id="${item.id}">×</button>
        </div>
    `).join('');
    
    // 绑定复选框事件
    list.querySelectorAll('.memo-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id);
            toggleMemoComplete(id);
        });
    });
    
    // 绑定删除按钮事件
    list.querySelectorAll('.memo-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(e.target.dataset.id);
            deleteMemo(id);
        });
    });
}

async function addMemo(content) {
    if (!content) {
        const input = document.getElementById('memoInput');
        content = input.value.trim();
        if (!content) {
            showToast('请输入食材名称', 'error');
            return;
        }
        input.value = '';
    }
    
    const res = await api('/memo', {
        method: 'POST',
        body: JSON.stringify({ content })
    });
    
    if (res.code === 200) {
        loadMemos();
    } else {
        showToast(res.msg || '添加失败', 'error');
    }
}

async function toggleMemoComplete(id) {
    const res = await api(`/memo/${id}/complete`, {
        method: 'PUT'
    });
    
    if (res.code === 200) {
        loadMemos();
    }
}

async function deleteMemo(id) {
    const res = await api(`/memo/${id}`, {
        method: 'DELETE'
    });
    
    if (res.code === 200) {
        showToast('删除成功！');
        loadMemos();
    }
}

// ========== 页面切换 ==========

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');
    document.querySelector(`.nav-btn[data-page="${pageName}"]`).classList.add('active');
    
    if (pageName === 'memo') loadMemos();
    if (pageName === 'favorites') loadFavorites();
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    loadFavorites();
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });
    
    document.getElementById('matchBtn').addEventListener('click', matchRecipes);
    
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('recipeModal').style.display = 'none';
    });
    
    document.getElementById('recipeModal').addEventListener('click', (e) => {
        if (e.target.id === 'recipeModal') {
            document.getElementById('recipeModal').style.display = 'none';
        }
    });
    
    document.getElementById('addIngredientBtn').addEventListener('click', () => {
        document.getElementById('addIngredientModal').style.display = 'block';
        document.getElementById('newIngredientName').focus();
    });
    
    document.getElementById('closeAddModal').addEventListener('click', () => {
        document.getElementById('addIngredientModal').style.display = 'none';
    });
    
    document.getElementById('addIngredientModal').addEventListener('click', (e) => {
        if (e.target.id === 'addIngredientModal') {
            document.getElementById('addIngredientModal').style.display = 'none';
        }
    });
    
    document.getElementById('submitIngredientBtn').addEventListener('click', addIngredient);
    
    document.getElementById('newIngredientName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addIngredient();
    });
    
    // 备忘录相关事件
    document.getElementById('addMemoBtn').addEventListener('click', () => addMemo());
    document.getElementById('memoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addMemo();
    });
});