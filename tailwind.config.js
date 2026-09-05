/** Tailwind konfiguratsiyasi — natija: assets/css/tailwind.css
 *  Qayta qurish:  npx tailwindcss@3 -i tailwind.input.css -o assets/css/tailwind.css --minify
 */
module.exports = {
  content: ['./*.html'],
  corePlugins: { preflight: false },   // reset assets/css/style.css ichida
  theme: {
    extend: {
      colors: {
        krem:'#FBF7F0', qogoz:'#FFFDF8', siyoh:'#1A1614',
        indigo1:'#1B3B6F', terrakota:'#C1502E', oltin:'#D4A24C'
      },
      fontFamily: {
        ust:['"Playfair Display"','Georgia','serif'],
        oq:['Lora','Georgia','serif'],
        ui:['Inter','system-ui','sans-serif']
      }
    }
  },
  plugins: []
}
