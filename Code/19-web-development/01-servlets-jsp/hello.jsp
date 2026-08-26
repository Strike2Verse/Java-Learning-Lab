<%-- Reference example only — requires a servlet container (like Apache
     Tomcat) to actually deploy and run. JSP files are not compiled with
     javac; the container compiles them into Servlets internally at
     request time. --%>

<html>
<body>
    <%-- <%= ... %> outputs a Java expression's value directly into the HTML --%>
    <h1>Hello, <%= request.getParameter("name") %>!</h1>

    <%-- <% ... %> runs Java code (like this loop) without directly outputting anything --%>
    <%
        int count = 5;
        for (int i = 0; i < count; i++) {
    %>
        <p>Line <%= i %></p>
    <%
        }
    %>
</body>
</html>
