// Script para el portal Jeffrey

document.addEventListener('DOMContentLoaded', function() {
    const gridItems = document.querySelectorAll('.grid-item');
    
    // Añadir eventos de click a cada sección
    gridItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            handleSectionClick(section);
        });
        
        // Efecto de escala al hacer click
        item.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        item.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
    });
    
    // Manejar clicks en las secciones
    function handleSectionClick(section) {
        console.log(`Navegando a: ${section}`);
        
        switch(section) {
            case 'project-university':
                alert('Navegando a Project University');
                // window.location.href = '/project-university';
                break;
            case 'pisos':
                alert('Navegando a Pisos');
                // window.location.href = '/pisos';
                break;
            case 'whatsapp':
                alert('Navegando a Grupos de Whatsapp');
                // window.location.href = '/whatsapp';
                break;
            case 'noticias':
                alert('Navegando a Noticias');
                // window.location.href = '/noticias';
                break;
            case 'puc':
                alert('Navegando a PUC');
                // window.location.href = '/puc';
                break;
            case 'descuentos':
                alert('Navegando a Descuentos');
                // window.location.href = '/descuentos';
                break;
            case 'viajes':
                alert('Navegando a Viajes');
                // window.location.href = '/viajes';
                break;
            case '404':
                alert('Navegando a 404 Not Found');
                // window.location.href = '/404';
                break;
            default:
                console.log('Sección desconocida');
        }
    }
    
    // Detección de orientación en móvil
    function checkOrientation() {
        const container = document.querySelector('.grid-container');
        if (window.matchMedia("(orientation: landscape) and (max-width: 768px)").matches) {
            console.log('Modo landscape en móvil detectado');
        }
    }
    
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    // Animación de los iconos
    function animateIcons() {
        const icons = document.querySelectorAll('.icon');
        icons.forEach((icon, index) => {
            setTimeout(() => {
                icon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
    }
    
    // Animar iconos cada 5 segundos
    setInterval(animateIcons, 5000);
    
    console.log('Portal Jeffrey cargado correctamente - 8 secciones activas');
});
