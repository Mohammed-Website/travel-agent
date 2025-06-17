const websiteDomainName = 'sample-travel-website-domain';

// Cache for storing fetched data
let dataCache = {
    clickData: null,
    visitorData: null,
    lastFetched: null
};

// Fetch all data from Supabase
async function fetchAllData() {
    console.log('Fetching data from Supabase...');

    try {
        // Fetch click data (this one has a website column)
        const { data: clickData, error: clickError } = await supabase
            .from('click_counter')
            .select('*')
            .ilike('website', `%${websiteDomainName}%`);

        if (clickError) throw clickError;
        console.log('Click data:', clickData);
        dataCache.clickData = clickData;

        // Fetch visitor data for the specific domain
        const { data: visitorData, error: visitorError } = await supabase
            .from('visitor_counter')
            .select('*')
            .eq('website', websiteDomainName)
            .single();

        if (visitorError && visitorError.code !== 'PGRST116') { // Ignore no rows found error
            console.error('Error fetching visitor data:', visitorError);
            dataCache.visitorData = null;
        } else {
            console.log('Visitor data:', visitorData);
            dataCache.visitorData = visitorData || null;
        }



        dataCache.lastFetched = new Date();
        console.log('All data fetched and cached at:', dataCache.lastFetched);

        return dataCache;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Make toggleSidebar globally available
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }
};

// Close sidebar when clicking outside
window.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');

    if (sidebar && sidebarToggle && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Render data in a card grid
function renderOutput(title, dataList, isTable = false) {
    const container = document.getElementById('output');

    // Clear previous content
    container.innerHTML = `
        <h1 class="section-title">${title}</h1>
    `;


    if (isTable) {
        renderTable(container, dataList);
    } else {
        renderCards(container, dataList);
    }
}

// Render data as cards
function renderCards(container, dataList) {
    const grid = document.createElement('div');
    grid.className = 'data-grid';

    dataList.forEach(data => {
        const card = document.createElement('div');
        card.className = 'data-card';

        // Check if it's a key-value pair or a more complex data structure
        if (data.label && data.value !== undefined) {
            const value = data.isHtml ? data.value : formatNumber(data.value);
            card.innerHTML = `
                <h3 class="rtl-text">${data.label}</h3>
                <div class="data-value">${value}</div>
                ${data.description ? `<div class="data-description rtl-text">${data.description}</div>` : ''}
            `;
        } else if (data.title) {
            // For more complex data with title and items
            const itemsHtml = data.items ? data.items.map(item => {
                const value = item.isHtml ? item.value : formatNumber(item.value);
                const highlightClass = item.highlight ? ' highlight' : '';
                return `
                    <div class="data-item${highlightClass}">
                        <span class="item-label rtl-text">${item.label}:</span>
                        <span class="item-value">${value}</span>
                    </div>`;
            }).join('') : '';

            card.innerHTML = `
                <h3 class="rtl-text">${data.title}</h3>
                <div class="data-items">${itemsHtml}</div>
            `;
        }

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

// Render data as a horizontal chart with months in a single row
function renderTable(container, dataList) {
    if (!dataList || dataList.length === 0) {
        container.innerHTML += '<div class="no-data">لا توجد بيانات متاحة</div>';
        return;
    }

    // Clear previous content
    container.innerHTML = '';
    
    // Create the main container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'horizontal-chart-container';
    chartContainer.style.overflowX = 'auto';
    chartContainer.style.padding = '20px 0';
    chartContainer.style.marginTop = '20px';
    
    // Create the chart wrapper
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'horizontal-chart-wrapper';
    chartWrapper.style.display = 'flex';
    chartWrapper.style.gap = '15px';
    chartWrapper.style.padding = '0 20px';
    chartWrapper.style.minWidth = 'max-content';
    
    // Extract data for the chart
    const months = [];
    const values = [];
    
    // Process data to get months and values
    dataList.forEach(item => {
        const monthName = Object.values(item)[0];
        const value = parseInt(Object.values(item)[1]) || 0;
        months.push(monthName);
        values.push(value);
    });
    
    // Find max value for scaling
    const maxValue = Math.max(...values, 10);
    
    // Create chart elements for each month
    months.forEach((month, index) => {
        const value = values[index];
        const percentage = (value / maxValue) * 100;
        
        // Create month container
        const monthContainer = document.createElement('div');
        monthContainer.className = 'month-container';
        monthContainer.style.display = 'flex';
        monthContainer.style.flexDirection = 'column';
        monthContainer.style.alignItems = 'center';
        monthContainer.style.width = '70px';
        monthContainer.style.flexShrink = '0';
        
        // Create bar container
        const barContainer = document.createElement('div');
        barContainer.style.width = '100%';
        barContainer.style.height = '100px';
        barContainer.style.display = 'flex';
        barContainer.style.alignItems = 'flex-end';
        barContainer.style.justifyContent = 'center';
        barContainer.style.position = 'relative';
        
        // Create the bar background
        const barBackground = document.createElement('div');
        barBackground.style.width = '30px';
        barBackground.style.height = '100%';
        barBackground.style.backgroundColor = 'rgba(0,0,0,0.03)';
        barBackground.style.borderRadius = '6px';
        barBackground.style.position = 'relative';
        barBackground.style.overflow = 'hidden';
        
        // Create the bar fill with gradient
        const barFill = document.createElement('div');
        barFill.className = 'bar-fill';
        barFill.style.position = 'absolute';
        barFill.style.bottom = '0';
        barFill.style.left = '0';
        barFill.style.width = '100%';
        barFill.style.height = '0';
        barFill.style.background = 'linear-gradient(to top, #4a90e2, #2c7be5)';
        barFill.style.borderRadius = '6px 6px 0 0';
        barFill.style.transition = 'height 0.6s ease';
        
        // Animate the bar height
        setTimeout(() => {
            barFill.style.height = `${percentage}%`;
        }, 100 + (index * 50));
        
        // Create value label
        const valueLabel = document.createElement('div');
        valueLabel.className = 'chart-value';
        valueLabel.textContent = formatNumber(value);
        valueLabel.style.marginTop = '10px';
        valueLabel.style.fontWeight = '600';
        valueLabel.style.color = '#2c3e50';
        valueLabel.style.fontSize = '13px';
        
        // Create month name
        const monthLabel = document.createElement('div');
        monthLabel.className = 'chart-month';
        monthLabel.textContent = month.split(' ')[0]; // Show only month name without year
        monthLabel.style.marginTop = '8px';
        monthLabel.style.fontSize = '13px';
        monthLabel.style.color = '#5d6d7e';
        monthLabel.style.fontWeight = '500';
        
        // Assemble the bar
        barBackground.appendChild(barFill);
        barContainer.appendChild(barBackground);
        
        // Add elements to month container
        monthContainer.appendChild(barContainer);
        monthContainer.appendChild(valueLabel);
        monthContainer.appendChild(monthLabel);
        
        // Add hover effect
        monthContainer.addEventListener('mouseenter', () => {
            barFill.style.opacity = '0.9';
            barFill.style.boxShadow = '0 4px 15px rgba(44, 123, 229, 0.3)';
            valueLabel.style.color = '#1a365d';
            valueLabel.style.fontWeight = '700';
            monthLabel.style.color = '#2c3e50';
        });
        
        monthContainer.addEventListener('mouseleave', () => {
            barFill.style.opacity = '1';
            barFill.style.boxShadow = 'none';
            valueLabel.style.color = '#2c3e50';
            valueLabel.style.fontWeight = '600';
            monthLabel.style.color = '#5d6d7e';
        });
        
        // Add to chart
        chartWrapper.appendChild(monthContainer);
    });
    
    // Add the chart wrapper to the container
    chartContainer.appendChild(chartWrapper);
    container.appendChild(chartContainer);
    
    // Add some styles
    const style = document.createElement('style');
    style.textContent = `
        .horizontal-chart-container {
            direction: ltr;
            margin: 0 auto;
            max-width: 100%;
            padding: 20px 0;
        }
        
        .month-container {
            transition: transform 0.3s ease;
        }
        
        .month-container:hover {
            transform: translateY(-5px);
        }
        
        .bar-fill {
            background: linear-gradient(to top, #4a90e2, #2c7be5);
        }
        
        .chart-value {
            font-family: 'Tajawal', sans-serif;
        }
        
        .chart-month {
            font-family: 'Tajawal', sans-serif;
        }
        
        @media (max-width: 768px) {
            .month-container {
                width: 50px !important;
            }
            
            .bar-container {
                height: 150px !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize data loading on page load
let isDataLoaded = false;

// Process click data
function processClickData(clickData) {
    try {
        console.log('Processing click data:', clickData);

        // If no data, show message
        if (!clickData || clickData.length === 0) {
            return renderOutput("📞 عدد نقرات تواصل العملاء", [
                { label: "لا توجد بيانات متاحة", value: "لا توجد بيانات نقرات متاحة" }
            ]);
        }

        const clickDataItem = clickData[0];
        const clickChartData = [];
        const clickTableData = [];

        // Define month names in English and Arabic
        const monthNames = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const arabicMonthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];

        // Get current date
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Generate data for all 12 months of the current year
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, i, 1); // January (0) to December (11)
            const monthIndex = date.getMonth();
            const monthName = date.toLocaleString('en-US', { month: 'long' });
            const arabicMonthName = arabicMonthNames[monthIndex];
            const monthKey = `${arabicMonthName} ${date.getFullYear()}`;

            // Default to 0 if no data
            let clicksValue = 0;

            // Get the corresponding month name in English from the database
            const dbMonth = monthNames[monthIndex];

            // Check if we have data for this month
            if (clickDataItem && clickDataItem[dbMonth]) {
                // Extract the numeric value from the database
                const value = clickDataItem[dbMonth];
                if (typeof value === 'string' && value.startsWith('Clicks ')) {
                    clicksValue = parseInt(value.replace('Clicks ', ''), 10) || 0;
                } else if (!isNaN(value)) {
                    clicksValue = parseInt(value, 10);
                }
            }

            // Add to chart data
            clickChartData.push({
                month: monthName,
                clicks: clicksValue
            });


            // Add to table data with proper percentage calculation
            clickTableData.push({
                'الشهر': monthKey,
                'عدد النقرات': clicksValue,
            });
        }

        // Calculate total clicks (only count months with data)
        const totalClicks = clickChartData.reduce((sum, item) => sum + (item.clicks || 0), 0);

        // Render summary cards
        renderOutput("عدد نقرات تواصل العملاء 📞", [
            {
                title: 'نظرة عامة على النقرات',
                items: [
                    { label: 'إجمالي عدد التواصل', value: totalClicks },
                    { label: 'متوسط عدد التواصل الشهري', value: Math.round(clickChartData.length ? totalClicks / 12 : 0) },
                    { label: 'أعلى شهر عدد تواصل', value: clickChartData.length ? Math.max(...clickChartData.map(item => item.clicks || 0)) : 0 }
                ]
            }
        ]);

        // Get or create content container
        let contentContainer = document.getElementById('content-container');
        if (!contentContainer) {
            contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            const output = document.getElementById('output');
            if (output) {
                output.appendChild(contentContainer);
            }
        }
        
        // Clear previous content
        contentContainer.innerHTML = '';

        // Add chart container with a unique ID
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'clicksChartContainer';

        // Create new chart container
        chartContainer.innerHTML = `
            <h3>توزيع النقرات الشهري</h3>
            <div style="height: 300px; position: relative;">
                <canvas id="clicksChart" width="100%" height="300"></canvas>
            </div>
        `;

        // Add chart to content container
        contentContainer.appendChild(chartContainer);

        // Add table section with subtitle
        const tableSection = document.createElement('div');
        tableSection.className = 'mt-4';
        tableSection.innerHTML = `
            <h3 class="rtl-text" style="text-align: right; margin: 20px 0 15px;">تفاصيل النقرات الشهرية</h3>
        `;
        contentContainer.appendChild(tableSection);

        // Render the table data
        renderTable(contentContainer, clickTableData);

        // Render chart after DOM is updated
        setTimeout(() => {
            const chartElement = document.getElementById('clicksChart');
            if (chartElement && typeof Chart !== 'undefined') {
                try {
                    renderClicksChart(clickChartData);
                } catch (error) {
                    console.error('Error rendering clicks chart:', error);
                }
            } else {
                console.warn('Click chart container not found or Chart.js not loaded');
            }
        }, 300);

    } catch (error) {
        console.error('Error processing click data:', error);
        console.error('Error in processClickData:', error);
        renderOutput("📊 إحصائيات النقرات", [
            { label: "خطأ", value: "لا يمكن تحميل بيانات النقرات", description: error.message }
        ]);
    }
}

function renderClicksChart(data) {
    console.log('Rendering enhanced clicks chart with data:', data);
    
    // Get the container where we'll put our chart
    const chartContainer = document.getElementById('clicksChartContainer');
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }
    
    // Clear previous content
    chartContainer.innerHTML = '';
    
    // Create a title for the chart
    const title = document.createElement('h3');
    title.textContent = 'إحصائيات النقرات الشهرية';
    title.style.textAlign = 'center';
    title.style.marginBottom = '25px';
    title.style.color = '#2c3e50';
    title.style.fontFamily = 'Tajawal, sans-serif';
    title.style.fontSize = '1.5rem';
    title.style.fontWeight = '600';
    
    // Create a scrollable container for the chart
    const scrollContainer = document.createElement('div');
    scrollContainer.style.overflowX = 'auto';
    scrollContainer.style.padding = '25px 15px';
    scrollContainer.style.background = 'linear-gradient(145deg, #ffffff, #f5f7fa)';
    scrollContainer.style.borderRadius = '12px';
    scrollContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
    scrollContainer.style.border = '1px solid rgba(0,0,0,0.05)';
    
    // Create the chart container
    const chartInner = document.createElement('div');
    chartInner.style.minWidth = 'max-content';
    chartInner.style.display = 'flex';
    chartInner.style.gap = '25px';
    chartInner.style.padding = '0 25px';
    chartInner.style.alignItems = 'flex-end';
    
    // Sort data by month (chronologically)
    const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
    
    const sortedData = [...data].sort((a, b) => {
        return monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase());
    });
    
    // Arabic month names
    const arabicMonths = {
        'january': 'يناير', 'february': 'فبراير', 'march': 'مارس',
        'april': 'أبريل', 'may': 'مايو', 'june': 'يونيو',
        'july': 'يوليو', 'august': 'أغسطس', 'september': 'سبتمبر',
        'october': 'أكتوبر', 'november': 'نوفمبر', 'december': 'ديسمبر'
    };
    
    // Find the maximum value for scaling
    const maxValue = Math.max(...sortedData.map(item => item.clicks), 10);
    
    // Create a bar for each month
    sortedData.forEach((item, index) => {
        const monthName = item.month.toLowerCase();
        const arabicMonth = arabicMonths[monthName] || item.month;
        const value = item.clicks || 0;
        const percentage = (value / maxValue) * 100;
        
        // Create month container
        const monthContainer = document.createElement('div');
        monthContainer.className = 'month-item';
        monthContainer.style.display = 'flex';
        monthContainer.style.flexDirection = 'column';
        monthContainer.style.alignItems = 'center';
        monthContainer.style.width = '70px';
        monthContainer.style.flexShrink = '0';
        monthContainer.style.transition = 'all 0.3s ease';
        
        // Create bar container
        const barContainer = document.createElement('div');
        barContainer.style.width = '100%';
        barContainer.style.height = '220px';
        barContainer.style.display = 'flex';
        barContainer.style.alignItems = 'flex-end';
        barContainer.style.justifyContent = 'center';
        barContainer.style.marginBottom = '15px';
        barContainer.style.position = 'relative';
        
        // Create the bar background
        const barBackground = document.createElement('div');
        barBackground.style.width = '40px';
        barBackground.style.height = '100%';
        barBackground.style.backgroundColor = 'rgba(0,0,0,0.03)';
        barBackground.style.borderRadius = '8px';
        barBackground.style.position = 'relative';
        barBackground.style.overflow = 'hidden';
        barBackground.style.transition = 'all 0.3s ease';
        
        // Create gradient colors based on value
        const hue = 200 + (index * 20) % 140; // Generate different colors
        const gradientStart = `hsl(${hue}, 80%, 60%)`;
        const gradientEnd = `hsl(${hue + 20}, 80%, 50%)`;
        
        // Create the bar fill with gradient
        const barFill = document.createElement('div');
        barFill.style.position = 'absolute';
        barFill.style.bottom = '0';
        barFill.style.left = '0';
        barFill.style.width = '100%';
        barFill.style.height = '0';
        barFill.style.background = `linear-gradient(to top, ${gradientStart}, ${gradientEnd})`;
        barFill.style.borderRadius = '8px 8px 0 0';
        barFill.style.transition = 'height 0.8s ease, box-shadow 0.3s ease';
        barFill.style.boxShadow = `0 4px 15px rgba(0,0,0,0.1)`;
        
        // Animate the bar height after a small delay
        setTimeout(() => {
            barFill.style.height = `${percentage}%`;
        }, 100 + (index * 50));
        
        // Add value label with animation
        const valueLabel = document.createElement('div');
        valueLabel.textContent = value.toLocaleString();
        valueLabel.style.position = 'absolute';
        valueLabel.style.top = '8px';
        valueLabel.style.left = '0';
        valueLabel.style.width = '100%';
        valueLabel.style.textAlign = 'center';
        valueLabel.style.fontWeight = 'bold';
        valueLabel.style.color = '#2c3e50';
        valueLabel.style.fontSize = '12px';
        valueLabel.style.opacity = '0';
        valueLabel.style.transform = 'translateY(-10px)';
        valueLabel.style.transition = 'all 0.5s ease';
        
        // Add month name
        const monthLabel = document.createElement('div');
        monthLabel.textContent = arabicMonth;
        monthLabel.style.textAlign = 'center';
        monthLabel.style.fontSize = '13px';
        monthLabel.style.fontWeight = '600';
        monthLabel.style.color = '#5d6d7e';
        monthLabel.style.marginTop = '12px';
        monthLabel.style.whiteSpace = 'nowrap';
        monthLabel.style.transition = 'all 0.3s ease';
        
        // Create a dot indicator for the current month
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
        if (monthName === currentMonth) {
            const currentIndicator = document.createElement('div');
            currentIndicator.textContent = '•';
            currentIndicator.style.color = gradientStart;
            currentIndicator.style.fontSize = '24px';
            currentIndicator.style.lineHeight = '10px';
            currentIndicator.style.marginBottom = '5px';
            currentIndicator.style.animation = 'pulse 2s infinite';
            monthContainer.prepend(currentIndicator);
        }
        
        // Assemble the bar
        barBackground.appendChild(barFill);
        barBackground.appendChild(valueLabel);
        barContainer.appendChild(barBackground);
        
        // Add elements to month container
        monthContainer.appendChild(barContainer);
        monthContainer.appendChild(monthLabel);
        
        // Add hover effect
        monthContainer.addEventListener('mouseenter', () => {
            barFill.style.opacity = '0.95';
            barFill.style.boxShadow = `0 8px 25px ${gradientStart}80`;
            barBackground.style.transform = 'translateY(-5px) scale(1.02)';
            barBackground.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            valueLabel.style.opacity = '1';
            valueLabel.style.transform = 'translateY(0)';
            monthLabel.style.color = '#2c3e50';
            monthLabel.style.fontWeight = '700';
        });
        
        monthContainer.addEventListener('mouseleave', () => {
            barFill.style.opacity = '1';
            barFill.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            barBackground.style.transform = 'none';
            barBackground.style.boxShadow = 'none';
            valueLabel.style.opacity = '0';
            valueLabel.style.transform = 'translateY(-10px)';
            monthLabel.style.color = '#5d6d7e';
            monthLabel.style.fontWeight = '600';
        });
        
        // Add to chart
        chartInner.appendChild(monthContainer);
    });
    
    // Assemble the chart
    scrollContainer.appendChild(chartInner);
    chartContainer.appendChild(title);
    chartContainer.appendChild(scrollContainer);
    
    // Add some responsive styles and animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.7; }
        }
        
        .month-item {
            transition: all 0.3s ease;
        }
        
        .month-item:hover {
            transform: translateY(-5px);
        }
        
        @media (max-width: 768px) {
            .month-item {
                width: 50px !important;
            }
            .month-item div:first-child {
                height: 180px !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Animate the chart container
    chartContainer.style.opacity = '0';
    chartContainer.style.transform = 'translateY(20px)';
    chartContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        chartContainer.style.opacity = '1';
        chartContainer.style.transform = 'translateY(0)';
    }, 100);
    
    return chartContainer;
}

// Load and display click data
async function loadClickData() {
    // Close the sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    try {
        // Clear the output and set the main title first
        const output = document.getElementById('output');
        if (output) {
            output.innerHTML = `
                <h1 class="section-title">عدد نقرات تواصل العملاء</h1>
                <div id="content-container"></div>
            `;
        }

        // Show loading state
        const contentContainer = document.getElementById('content-container') || output;
        contentContainer.innerHTML = '<p>جاري تحميل البيانات...</p>';

        // Fetch data if not already loaded
        if (!isDataLoaded) {
            await fetchAllData();
            isDataLoaded = true;
        }

        // Use cached data
        if (dataCache.clickData && dataCache.clickData.length > 0) {
            console.log('Using cached click data');
            return processClickData(dataCache.clickData);
        } else {
            throw new Error('No click data available for the current domain');
        }
    } catch (error) {
        console.error('Error loading click data:', error);
        renderOutput("📊 إحصائيات النقرات", [
            {
                title: 'خطأ في تحميل البيانات',
                items: [
                    { label: 'التفاصيل', value: error.message },
                    { label: 'الحل', value: 'الرجاء التحقق من اتصال الشبكة أو تحديث الصفحة' }
                ]
            }
        ]);
    }
}

// Load and display visitor data
async function loadVisitorData() {
    // Close the sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    try {
        // Show loading state
        renderOutput("جاري تحميل بيانات زوار الموقع... 👥", [
            {
                title: 'جاري التحميل ...',
                items: [
                    { label: 'الحالة ', value: 'قيد التحميل' },
                    { label: 'اسم الموقع ', value: websiteDomainName }
                ]
            }
        ]);

        // Always fetch fresh data
        await fetchAllData();
        isDataLoaded = true;

        // Check if we have visitor data
        if (!dataCache.visitorData) {
            console.warn('لم يتم العثور على بيانات لعدد زوار الموقع:', websiteDomainName);
            return renderOutput("👥 زوار الموقع", [
                {
                    title: 'لاتوجد بيانات متاحة',
                    items: [
                        { label: 'الحالة', value: 'لاتوجد بيانات متاحة لإسم الموقع هذا' },
                        { label: 'اسم الموقع', value: websiteDomainName },
                        { label: 'النصيحة', value: 'تأكد ان هذا الموقع مسجل في قاعدة البيانات' }
                    ]
                }
            ]);
        }

        console.log('جاري تحميل بيانات زوار الموقع:', dataCache.visitorData);
        return processVisitorData(dataCache.visitorData);
    } catch (error) {
        console.error('Error loading visitor data:', error);
        renderOutput("👥 زوار الموقع", [
            {
                title: 'خطأ في تحميل البيانات',
                items: [
                    { label: 'خطأ', value: error.message },
                    { label: 'الحل', value: 'يرجى التأكد من اتصالك بالانترنت وقم بتحديث الصفحة' },
                    { label: 'اسم الموقع', value: websiteDomainName }
                ]
            }
        ]);
    }
}

// Render visitor chart using Chart.js
function renderVisitorChart(monthlyData) {
    console.log('Rendering visitor chart with data:', monthlyData);
    const canvas = document.getElementById('visitorChart');
    if (!canvas) {
        console.error('Visitor chart canvas not found');
        return;
    }

    // Check if there's an existing chart and destroy it
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context for visitor chart');
        return;
    }

    // Ensure we have data to display
    if (!monthlyData || monthlyData.length === 0) {
        console.warn('No data available for visitor chart');
        return;
    }

    // Prepare data for the chart
    const labels = monthlyData.map(item => item.month);
    const values = monthlyData.map(item => item.visitors);

    // Calculate trend line (simple linear regression)
    const xValues = Array.from({ length: monthlyData.length }, (_, i) => i);
    const n = xValues.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    values.forEach((y, i) => {
        sumX += xValues[i];
        sumY += y;
        sumXY += xValues[i] * y;
        sumXX += xValues[i] * xValues[i];
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendLine = xValues.map(x => slope * x + intercept);

    // Calculate percentage change
    const firstMonth = values[0];
    const lastMonth = values[values.length - 1];
    const percentageChange = firstMonth > 0 ?
        Math.round(((lastMonth - firstMonth) / firstMonth) * 100) : 0;

    // Create gradient for the chart area
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.2)');
    gradient.addColorStop(1, 'rgba(52, 152, 219, 0.05)');

    // Create the chart
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Visitors',
                    data: values,
                    borderColor: '#3498db',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#3498db',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'Trend Line',
                    data: trendLine,
                    borderColor: '#e74c3c',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true,
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        boxWidth: 12
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    rtl: true,
                    textDirection: 'rtl',
                    titleFont: {
                        family: 'Tajawal, sans-serif'
                    },
                    bodyFont: {
                        family: 'Tajawal, sans-serif'
                    },
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                const value = Math.round(context.parsed.y);
                                label += new Intl.NumberFormat('en-US').format(value);
                                if (context.datasetIndex === 1) {
                                    label += ' (trend)';
                                }
                            }
                            return label;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Monthly Visitor Trend',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        }
                    }
                },
                subtitle: {
                    display: true,
                    text: percentageChange >= 0 ?
                        `↑ ${Math.abs(percentageChange)}% from first month` :
                        `↓ ${Math.abs(percentageChange)}% from first month`,
                    color: percentageChange >= 0 ? '#27ae60' : '#e74c3c',
                    font: {
                        size: 12,
                        weight: 'normal'
                    },
                    padding: {
                        bottom: 10
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        padding: 10
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)'
                    },
                    ticks: {
                        callback: function (value) {
                            return new Intl.NumberFormat('en-US').format(value);
                        },
                        padding: 10
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            },
            elements: {
                line: {
                    tension: 0.3
                },
                point: {
                    hoverRadius: 8,
                    hoverBorderWidth: 2
                }
            }
        }
    });
}

// Process visitor data
function processVisitorData(visitorData) {
    try {
        console.log('Processing visitor data:', visitorData);

        // If no visitor data or data is not in expected format
        if (!visitorData || (Array.isArray(visitorData) && visitorData.length === 0)) {
            return renderOutput("بيانات زوار الموقع 👥", [
                {
                    title: 'زوار الموقع',
                    items: [
                        { label: 'لاتوجد بيانات متاحة', value: 'يرجى المحاولة لاحقاً' }
                    ]
                }
            ]);
        }

        // Define month names in English and Arabic
        const monthNames = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const arabicMonthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        const monthDisplayNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        const now = new Date();
        const currentMonth = monthNames[now.getMonth()];
        const currentYear = now.getFullYear();

        // Parse visitor counts from the visitor data
        const parseVisitCount = (value) => {
            if (!value) return 0;
            if (typeof value === 'number') return value;
            const match = value.match(/Visit\s*(\d+)/i);
            return match ? parseInt(match[1], 10) : 0;
        };

        // Calculate statistics
        const monthlyStats = [];
        let totalVisitors = 0;
        let monthsWithData = 0;

        // Process each month
        monthNames.forEach((month, index) => {
            const count = parseVisitCount(visitorData[month]);
            if (count > 0) {
                monthlyStats.push({
                    month: arabicMonthNames[index],
                    monthEn: monthNames[index],
                    count: count,
                    year: currentYear - (index > now.getMonth() ? 1 : 0) // Handle year transition
                });
                totalVisitors += count;
                monthsWithData++;
            }
        });

        // Calculate statistics
        const thisMonthVisitors = parseVisitCount(visitorData[currentMonth]);
        const averageMonthlyVisitors = monthsWithData > 0 ? Math.round(totalVisitors / monthsWithData) : 0;

        // Sort monthly stats chronologically
        monthlyStats.sort((a, b) => {
            const monthA = monthNames.findIndex(m => m.toLowerCase() === a.month.toLowerCase());
            const monthB = monthNames.findIndex(m => m.toLowerCase() === b.month.toLowerCase());
            return a.year - b.year || monthA - monthB;
        });

        // Prepare data for the chart
        const chartData = monthlyStats.map(stat => ({
            month: stat.month,
            visitors: stat.count
        }));

        // Prepare statistics for display
        const stats = [
            { label: '📅 الشهر الحالي', value: thisMonthVisitors.toLocaleString(), icon: '' },
            { label: '👥 مجموع الزوار', value: totalVisitors.toLocaleString(), icon: '' },
            { label: '📊 المتوسط الشهري', value: averageMonthlyVisitors.toLocaleString(), icon: '' }
        ];

        // Show visitor summary in cards
        renderOutput("بيانات زوار الموقع 👥", [
            {
                title: 'نظرة عامة',
                items: stats.map(stat => ({
                    label: stat.label,
                    value: `<span class="ltr-text">${stat.icon} ${stat.value}</span>`,
                    highlight: stat.label === 'الشهر الحالي' || stat.label === 'المتوسط الشهري',
                    isHtml: true
                }))
            },
            {
                title: 'تفاصيل زوار كل شهر',
                items: monthlyStats.slice(-6).map(stat => {
                    const isCurrentMonth = stat.monthEn === monthNames[now.getMonth()];
                    return {
                        label: stat.month,
                        value: `<span class="ltr-text">${stat.count.toLocaleString()}</span>`,
                        highlight: isCurrentMonth,
                        isHtml: true
                    };
                }).reverse()
            }
        ]);

        // Render the visitor chart with monthly data
        setTimeout(() => {
            const chartElement = document.getElementById('visitorChart');
            if (chartElement && typeof Chart !== 'undefined') {
                renderVisitorChart(chartData);
            }
        }, 100);

    } catch (error) {
        console.error('Error processing visitor data:', error);
        renderOutput("👥 إحصائيات الزوار", [
            { label: "خطأ", value: "حدث خطأ أثناء معالجة بيانات الزوار", description: error.message }
        ]);
        throw error;
    }
}

// Initialize the page
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch all data on initial load
        await fetchAllData();
        isDataLoaded = true;

        // Default to showing click data
        await loadClickData();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Toggle sidebar function
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}