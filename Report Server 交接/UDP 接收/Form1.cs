using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Threading;

using System.Net;
using System.Net.Sockets;
using System.IO;

using MySql.Data.MySqlClient;
using MySql.Data;
using System.Text.RegularExpressions;

namespace ReportUDPserver_002
{
    public partial class Form1 : Form
    {
        static int port = 514;
        //Port端

        static int bufferlimit = 1000000;
        int total = 0;
        int recivetotal = 0;

        Thread main;
        Thread t1;
        Thread t2;
        Thread t3;
        Thread t4;

        Queue<string> buffer;
        //UDP Buffer

        #region Sql語法

        string creatTrafficTableSql = "CREATE TABLE `report_server_db`.`" + "des_" + DateTime.Now.ToString("yyyy_MM_dd") + "` " +
    "( `count` INT( 255 ) NOT NULL AUTO_INCREMENT," +
      "`receive_tim` VARCHAR(30) NOT NULL," +
      "`dname` VARCHAR(30) NOT NULL," +
      "`serial` VARCHAR(30) NOT NULL," +
      "`type` INT(5) NOT NULL ," +
      "`subtype` INT(5) NOT NULL ," +
      "`id` VARCHAR(30) NOT NULL ," +
      "`flag` VARCHAR(20) NOT NULL ," +
      "`proto` VARCHAR(12) NOT NULL ," +
      "`rule` VARCHAR(40) NOT NULL ," +
      "`src` VARCHAR(12) NOT NULL ," +
      "`dst` VARCHAR(12) NOT NULL ," +
      "`sport` VARCHAR(5) NOT NULL ," +
      "`dport` VARCHAR(5) NOT NULL ," +
      "`natsrc` VARCHAR(12) NOT NULL ," +
      "`natdst` VARCHAR(12) NOT NULL ," +
      "`natsport` VARCHAR(5) NOT NULL ," +
      "`natdport` VARCHAR(5) NOT NULL ," +
      "`from_zone` VARCHAR(12) NOT NULL ," +
      "`to_zone` VARCHAR(12) NOT NULL ," +
      "`inbound_if` VARCHAR(20) NOT NULL ," +
      "`outbound_if` VARCHAR(20) NOT NULL ," +
      "`bytes_tx` VARCHAR(100) NOT NULL ," +
      "`bytes_rx` VARCHAR(100) NOT NULL ," +
      "`pkts_tx` VARCHAR(100) NOT NULL ," +
      "`pkts_rx` VARCHAR(100) NOT NULL ," +
      "PRIMARY KEY (  `count` )) ENGINE = MYISAM ;";
        //Traffic Sql 語法

        #endregion

        public Form1()
        {
            InitializeComponent();
            Form.CheckForIllegalCrossThreadCalls = false;
            //取消Thread驗證
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            button1.Text = "暫停接收Log";
            main = new Thread(udpreceive);
            main.Start();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if ((t1.ThreadState == ThreadState.Unstarted) || (t1.ThreadState == ThreadState.Stopped))
            {
                main.Start();
            }
            else
            {
                main.Abort();
            }
        }

        private void udpreceive()
        {
            t1 = new Thread(ThreadControl1);
            t2 = new Thread(ThreadControl2);
            t3 = new Thread(ThreadControl3);
            t4 = new Thread(ThreadControl4);
            buffer = new Queue<string>();

            IPEndPoint ipep = new IPEndPoint(IPAddress.Any, port); //接收端口資訊
            Socket newsock = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, ProtocolType.Udp); //新增Socket
            newsock.Bind(ipep); //加入Socket接收資訊
            EndPoint Remote = (EndPoint)ipep; 
            byte[] getdata = new byte[1024]; //接收封包固定大小
            string input;
            int recv;

            while (true)
            {
                recv = newsock.ReceiveFrom(getdata, ref Remote);
                input = Encoding.UTF8.GetString(getdata, 0, recv); //把接收的byte資料轉回string型態
                recivetotal++;
                label3.Text = "接收總量：" + recivetotal.ToString();
                try
                {
                    if (buffer.Count < bufferlimit - 1)
                    {
                        buffer.Enqueue(input);
                    }

                    progressBar1.Value = buffer.Count;
                    label1.Text = "Buffer數量：" + buffer.Count.ToString();

                    t1.Start();
                    //t2.Start();
                }
                catch
                {
                }

                progressBar1.Value = buffer.Count;
            }
        }

        private void ThreadControl1()
        {
            dbconnect dbfun = new dbconnect();
            for (; ; )
            {
                if (buffer.Count > 10)
                {
                    dbfun.insertdatabase(dbfun.sqlconn("report_server_db", "root", "titan168"), splitLog(buffer.Dequeue(), "root", "titan168"));
                }
            }
        }

        private void ThreadControl2()
        {
            dbconnect dbfun = new dbconnect();
            for (; ; )
            {
                if (buffer.Count > 10)
                {
                    dbfun.insertdatabase(dbfun.sqlconn("report_server_db", "root", "titan168"), splitLog(buffer.Dequeue(), "root", "titan168"));
                }
            }
        }

        private void ThreadControl3()
        {
            dbconnect dbfun = new dbconnect();
            for (; ; )
            {
                if (buffer.Count != 0)
                {
                    try
                    {
                        dbfun.insertdatabase(dbfun.sqlconn("report_server_db", "root", "titan168"), splitLog(buffer.Dequeue(), "root", "titan168"));
                    }
                    catch
                    {
                    }
                }
            }
        }

        private void ThreadControl4()
        {
            dbconnect dbfun = new dbconnect();
            for (; ; )
            {
                if (buffer.Count != 0)
                {
                    try
                    {
                        dbfun.insertdatabase(dbfun.sqlconn("report_server_db", "root", "titan168"), splitLog(buffer.Dequeue(), "root", "titan168"));
                    }
                    catch
                    {
                    }
                }
            }
        }

        private string splitLog(string logmessage, string user, string pass)
        {
            string insertsql = "";
            total++;
            label2.Text = "已處理總量：" + total;
            if (logmessage != null)
            {
                string[] splittime = logmessage.Split('<');
                string[] splitdname = splittime[splittime.Length - 1].Split(':');
                string[] splitlogmessage = splitdname[splitdname.Length - 1].Split(' ');
                switch (Convert.ToInt32((splitlogmessage[2].Split('='))[splitlogmessage[2].Split('=').Length - 1]))
                {
                    case 1:

                        #region Sql變數(資料取得)

                        //string receive_tim_tmp = (Regex.Match(logmessage, "[^/s]*<").Value.Split('<'))[0];
                        //string receive_tim = receive_tim_tmp.Substring(0, receive_tim_tmp.Length - 2);
                        string receive_tim = "";
                        //string[] dnamesplit = Regex.Match(logmessage, "[^/s]*").Value.Split(' ');
                        //string dname = dnamesplit[8].Substring(0, dnamesplit[8].Length - 1);
                        string dname = "";
                        string serial = Regex.Replace(Regex.Match(logmessage, "serial=[^\\s]*").Value, "serial=", String.Empty);
                        string type = Regex.Replace(Regex.Match(logmessage, "type=[^\\s]*").Value, "type=", String.Empty);
                        string subtype = Regex.Replace(Regex.Match(logmessage, "subtype=[^\\s]*").Value, "subtype=", String.Empty);
                        string id = Regex.Replace(Regex.Match(logmessage, "id=[^\\s]*").Value, "id=", String.Empty);
                        string flag = Regex.Replace(Regex.Match(logmessage, "flag=[^\\s]*").Value, "flag=", String.Empty);
                        string proto = Regex.Replace(Regex.Match(logmessage, "proto=[^\\s]*").Value, "proto=", String.Empty);
                        string rule = Regex.Replace(Regex.Match(logmessage, "rule=[^\\s]*").Value, "rule=", String.Empty);
                        string src = Regex.Replace(Regex.Match(logmessage, "src=[^\\s]*").Value, "src=", String.Empty);
                        string dst = Regex.Replace(Regex.Match(logmessage, "dst=[^\\s]*").Value, "dst=", String.Empty);
                        string sport = Regex.Replace(Regex.Match(logmessage, "sport=[^\\s]*").Value, "sport=", String.Empty);
                        string dport = Regex.Replace(Regex.Match(logmessage, "dport=[^\\s]*").Value, "dport=", String.Empty);
                        string natsrc = Regex.Replace(Regex.Match(logmessage, "natsrc=[^\\s]*").Value, "natsrc=", String.Empty);
                        string natdst = Regex.Replace(Regex.Match(logmessage, "natdst=[^\\s]*").Value, "natdst=", String.Empty);
                        string natsport = Regex.Replace(Regex.Match(logmessage, "natsport=[^\\s]*").Value, "natsport=", String.Empty);
                        string natdport = Regex.Replace(Regex.Match(logmessage, "natdport=[^\\s]*").Value, "natdport=", String.Empty);
                        string from_zone = Regex.Replace(Regex.Match(logmessage, "from_zone=[^\\s]*").Value, "from_zone=", String.Empty);
                        string to_zone = Regex.Replace(Regex.Match(logmessage, "to_zone=[^\\s]*").Value, "to_zone=", String.Empty);
                        string inbound_if = Regex.Replace(Regex.Match(logmessage, "inbound_if=[^\\s]*").Value, "inbound_if=", String.Empty);
                        string outbount_if = Regex.Replace(Regex.Match(logmessage, "outbound_if=[^\\s]*").Value, "outbound_if=", String.Empty);
                        string bytes_tx = Regex.Replace(Regex.Match(logmessage, "bytes_tx=[^\\s]*").Value, "bytes_tx=", String.Empty);
                        string bytes_rx = Regex.Replace(Regex.Match(logmessage, "bytes_rx=[^\\s]*").Value, "bytes_rx=", String.Empty);
                        string pkts_tx = Regex.Replace(Regex.Match(logmessage, "pkts_tx=[^\\s]*").Value, "pkts_tx=", String.Empty);
                        string pkts_rx = Regex.Replace(Regex.Match(logmessage, "pkts_rx=[^\\s]*").Value, "pkts_rx=", String.Empty);

                        #endregion

                        insertsql = "INSERT INTO `report_server_db`.`des_" + DateTime.Now.ToString("yyyy_MM_dd") + "` (" +
                             "`count`,`receive_tim`,`dname`,`serial`,`type`,`subtype`,`id`,`flag`,`proto`,`rule`,`src`,`dst`,`sport`,`dport`,`natsrc`," +
                             "`natdst`,`natsport`,`natdport`,`from_zone`,`to_zone`,`inbound_if`,`outbound_if`,`bytes_tx`,`bytes_rx`,`pkts_tx`,`pkts_rx`)" +
                             "VALUES(NULL,'" + receive_tim + "','" + dname + "','" + serial + "','" + type + "','" + subtype + "','" + id + "','" +
                             flag + "','" + proto + "','" + rule + "','" + src + "','" + dst + "','" + sport + "','" + dport + "','" + natsrc + "','" +
                             natdst + "','" + natsport + "','" + natdport + "','" + from_zone + "','" + to_zone + "','" + inbound_if + "','" + outbount_if + "','" +
                             bytes_tx + "','" + bytes_rx + "','" + pkts_tx + "','" + pkts_rx + "');";
                        dbconnect dbfun = new dbconnect();
                        dbfun.creattable(dbfun.sqlconn("report_server_db", user, pass), "des_" + DateTime.Now.ToString("yyyy_MM_dd"), creatTrafficTableSql, "report_server_db");
                        break;
                    //Traffic Log 處理
                    case 2:
                        break;
                    case 3:
                        break;
                    case 4:
                        break;
                }
            }

            return insertsql;
        }
    }
}
