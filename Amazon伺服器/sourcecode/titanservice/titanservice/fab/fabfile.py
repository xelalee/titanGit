# -*- coding: utf-8 -*-
'''

'''
import ConfigParser
import os.path
from fabric.api import *

global host, key, warpath
#Read properties from local ini file
#"load host, key, warpath"
conf = ConfigParser.ConfigParser()
conf.read("initial.ini")

#host and key path are used by ssh        
host = conf.get("instance", "host")  
key = conf.get("instance", "key")

#used by deploy
register_war = conf.get("war", "register_war")

#database
mysql_root_password = conf.get("database", "mysql_root_password")

mysql_register_user = conf.get("database", "mysql_register_user")
mysql_register_password = conf.get("database", "mysql_register_password")
mysql_register_table_script = conf.get("database", "mysql_register_table_script")
mysql_register_data_script = conf.get("database", "mysql_register_data_script")
mysql_register_view_script = conf.get("database", "mysql_register_view_script")
mysql_register_update_script = conf.get("database", "mysql_register_update_script")


host_array = host.split(',')
    
env.hosts = host_array
env.user = 'ubuntu'
env.key_filename = [key]

def testConnection():
    connected = False
    while connected == False:
        print("Connecting... ")
        try:
            with settings(hide('warnings', 'stderr', 'running', 'stdout'), warn_only=True, abort_on_prompts=True):
                result = run('ls')
            connected = True
        except:
            print("Unable to connect the instance, Please check the Configuration.")
            raw_input("CTRL+C to quit... ")

def apt_get(*packages):
    sudo('apt-get -y --no-upgrade install %s' % (' '.join(packages)), shell=False)
    
@task
def install_mysql():
    sudo('echo "mysql-server-5.5 mysql-server/root_password password %s" | debconf-set-selections' % mysql_root_password)
    sudo('echo "mysql-server-5.5 mysql-server/root_password_again password %s" | debconf-set-selections' % mysql_root_password)
    apt_get('mysql-server-5.5')


@task
def create_mysql_user():
    database_command = "drop database IF EXISTS rgst"
    run('mysql -uroot -p'+mysql_root_password+' -e "%s"' % database_command)
    database_command = "create database rgst"
    run('mysql -uroot -p'+mysql_root_password+' -e "%s"' % database_command)
    create_user_command = "grant all on rgst.* to "+mysql_register_user+"@localhost identified by '"+mysql_register_password+"'"
    run('mysql -uroot -p'+mysql_root_password+' -e "%s"' % create_user_command)

@task
def init_db():
    put(mysql_register_table_script,'/home/ubuntu')
    sql_command = "source /home/ubuntu/"+mysql_register_table_script
    run('mysql -u'+mysql_register_user+' -p'+mysql_register_password+' rgst -e "%s"' % sql_command)
    put(mysql_register_data_script,'/home/ubuntu')
    sql_command = "source /home/ubuntu/"+mysql_register_data_script
    run('mysql -u'+mysql_register_user+' -p'+mysql_register_password+' rgst -e "%s"' % sql_command)
    put(mysql_register_view_script,'/home/ubuntu')
    sql_command = "source /home/ubuntu/"+mysql_register_view_script
    run('mysql -u'+mysql_register_user+' -p'+mysql_register_password+' rgst -e "%s"' % sql_command)    

@task
def init_db():
    install_mysql()
    create_mysql_user()
    init_db()
    
@task
def update_db():
    put(mysql_register_update_script,'/home/ubuntu')
    sql_command = "source /home/ubuntu/"+mysql_register_update_script
    run('mysql -u'+mysql_register_user+' -p'+mysql_register_password+' rgst -e "%s"' % sql_command) 

@task    
def deploywar(instancename, warname, warpath):
	print("***deploy or redeploy "+instancename+" on the cloud***")	
	while os.path.exists(warpath) is not True:
		print("The file path of "+warpath+" is wrong, CTRL+C to quit...")
		
	#Re-deploy war and start Tomcat
	put(warpath,'/home/ubuntu')
		
	#Stop Tomcat
	sudo('/etc/init.d/tomcat7 stop')
		
	#Un-deploy
	sudo('rm -rf /var/lib/tomcat7/webapps/'+instancename)
	sudo('rm -rf /var/lib/tomcat7/webapps/'+warname)
	
	sudo('cp /home/ubuntu/'+warname+' /var/lib/tomcat7/webapps/.')
	sudo('/etc/init.d/tomcat7 start')	
	

	
@task    
def deploy():
	print("war path: "+ register_war)	
	confirm = raw_input("Press Enter to continue with current settings or CTRL+C to quit...")
	testConnection()
	deploywar("register", "register.war",  register_war)


	
	