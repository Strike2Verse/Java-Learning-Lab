import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class SimpleClient {
    public static void main(String[] args) throws Exception {
        // SimpleServer must already be running and listening on port 5000
        // before this connects, otherwise the OS refuses the connection.
        Socket socket = new Socket("localhost", 5000);

        PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

        out.println("Hello from client!");
        String response = in.readLine();
        System.out.println("Server said: " + response);

        socket.close();
    }
}