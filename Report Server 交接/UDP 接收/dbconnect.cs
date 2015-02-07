using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Windows.Forms;

using MySql.Data.MySqlClient;

namespace ReportUDPserver_002
{
    class dbconnect
    {
        #region DatabaseConnect

        public MySqlConnection sqlconn(string dbname,string user, string pass)
        {
            string dbHost = "localhost";//資料庫位址
            string dbName = dbname;//資料庫名稱


            string connstr = "server=" + dbHost + ";uid=" + user + ";pwd=" + pass + ";database=" + dbName;
            MySqlConnection conn = new MySqlConnection(connstr);

            return conn;
        }

        #endregion
        //完成(測試完畢)

        #region CreatTable

        public void creattable(MySqlConnection conn, string tablename, string tablesql, string dbname)
        {
            bool havetable = false;
            try
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand("SHOW TABLES FROM " + dbname + ";", conn);
                MySqlDataReader mydata = cmd.ExecuteReader();
                if (mydata.HasRows)
                {
                    while (mydata.Read())
                    {
                        if (tablename == mydata.GetString(0))
                        {
                            havetable = true;
                            break;
                        }
                    }
                    mydata.Close();
                    if (!havetable)
                    {
                        MySqlCommand creatcmd = new MySqlCommand(tablesql, conn);
                        cmd.ExecuteNonQuery();
                    }
                }
                else
                {
                    mydata.Close();
                    MySqlCommand creatcmd = new MySqlCommand(tablesql, conn);
                    creatcmd.ExecuteNonQuery();
                }
            }
            catch (MySqlException ex)
            {
                MessageBox.Show(ex.Message);
            }
            finally
            {
                conn.Close();
            }

        }

        #endregion
        //完成(測試完畢)

        #region CreatDataBase

        public void creatdatabase(MySqlConnection conn, string dbname)
        {
            bool havedb = false;
            try
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand("SHOW DATABASES;", conn);
                MySqlDataReader mydata = cmd.ExecuteReader();
                if (mydata.HasRows)
                {
                    while (mydata.Read())
                    {
                        if (dbname == mydata.GetString(0))
                            havedb = true;
                    }
                    conn.Close();
                }
            }
            catch (MySqlException ex)
            {
                MessageBox.Show(ex.Message);
            }

            //string sql = "CREATE DATABASE  `testdb2`";
        }

        #endregion
        //未完成

        #region InsertDataBase

        public void insertdatabase(MySqlConnection conn, string sql)
        {
            if (sql != "")
            {
                try
                {
                    conn.Open();
                    MySqlCommand cmd = new MySqlCommand(sql, conn);
                    cmd.ExecuteNonQuery();
                }
                catch (MySqlException ex)
                {
                    MessageBox.Show(ex.Message);
                }
                finally
                {
                    conn.Close();
                }
            }
        }

        #endregion
        //完成(測試完畢)

        #region SelectDataBase

        public DataSet selectdata(MySqlConnection conn, string sql)
        {
            DataSet data = new DataSet();
            try
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand(sql);
                MySqlDataAdapter mydap = new MySqlDataAdapter(cmd);
                mydap.Fill(data);
            }
            catch (MySqlException ex)
            {
                MessageBox.Show(ex.Message);
            }
            finally
            {
                conn.Close();
            }

            return data;
        }

        #endregion
        //完成(未測試)
    }
}
