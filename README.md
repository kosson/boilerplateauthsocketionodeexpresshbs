În acest moment există riscul ca parolele care pleacă în socket la logare și la înregistrare să poată fi văzute cu o aplicație care să expună înformația în clar.

Ce este neapărat necesar este verificarea ca acest lucru să nu se întâmple. Dacă se întâmplă, atunci la inițierea socketului să se genereze un socket temporar cu id-ul generat de client. În cazul acesta ar trebui să hecăreși browserul ca să ai acces la socket.
