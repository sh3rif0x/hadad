 /* =========================================================
       FOOTER
    ========================================================= */

 export function initFooter() {

     const year =
         document.querySelector(".footer-year");

     if (!year) {
         return;
     }

     year.textContent =
         new Date().getFullYear();

 }


 document.addEventListener(
     "DOMContentLoaded",
     initFooter
 );