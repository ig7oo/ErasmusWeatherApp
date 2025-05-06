document.addEventListener('DOMContentLoaded', () => {
    const languageSelector = document.querySelector('.language-selector');
    const selectedLanguage = languageSelector.querySelector('.selected-language');
    const languageOptions = document.querySelectorAll('.language-option');

    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Get the clicked flag's src and alt
            const clickedFlag = option.querySelector('img');
            const clickedSrc = clickedFlag.src;
            const clickedAlt = clickedFlag.alt;
            
            // Get the current selected flag
            const currentFlag = selectedLanguage.querySelector('img');
            const currentSrc = currentFlag.src;
            const currentAlt = currentFlag.alt;
            
            // Swap the flags
            currentFlag.src = clickedSrc;
            currentFlag.alt = clickedAlt;
            clickedFlag.src = currentSrc;
            clickedFlag.alt = currentAlt;
        });
    });
});
