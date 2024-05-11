import time
import socket
import json

hostname = socket.gethostname()
UDP_IP = socket.gethostbyname(hostname)
print("***Local ip:" + str(UDP_IP) + "***")
UDP_PORT = 80
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind((UDP_IP, UDP_PORT))
sock.listen(1)  
data, addr = sock.accept()


def read_data():
    line = data.recv(1024).decode('UTF-8')
    uwb_list = []
    try:
        uwb_data = json.loads(line)
        print(uwb_data)
        uwb_list = uwb_data["links"]
        for uwb_archor in uwb_list:
            anchor_id = uwb_archor["A"]
            distance = float(uwb_archor["R"])
            
            print("Distance for Anchor " + anchor_id + ": " + str(distance))
    except:
        print(line)
    print("")
    return uwb_list



def main():
    while True:
        list = read_data()

        time.sleep(0.1)

if __name__ == '__main__':
    main()
