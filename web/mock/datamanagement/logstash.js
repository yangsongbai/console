var logstashConf = {
    jdbc: {
        type: 'oracle',
        config: ` jdbc_driver_library => "/etc/logstash/drivers/ojdbc8.jar"
        jdbc_driver_class => "Java::oracle.jdbc.driver.OracleDriver"
        jdbc_connection_string => "jdbc:oracle:test:@192.168.1.68:1521/testdb"
        jdbc_user => "testuser"
        jdbc_password => "testpwd"
    
        jdbc_paging_enabled => "true"
        jdbc_page_size => "1000"
    
        schedule => "*/1 * * * *"
        statement => "SELECT a.SID, a.SERIAL#, c.spid, a.USERNAME, a.SQL_ID, a.PROGRAM, a.TERMINAL, a.MACHINE, a.MODULE, a.LOGON_TIME, a.EVENT, a.seconds_in_wait, a.status, b.sql_text FROM v$session a, v$sqlarea b, v$process c WHERE a.sql_id = b.sql_id AND c.addr = a.paddr AND a.status = 'ACTIVE' AND a.USERNAME NOT IN ('SYS', 'SYSMAN', 'DBSNMP')"
        last_run_metadata_path =>"/tmp/logstash_jdbc_last_run_oracle-xxfnd-log-messages.txt"
    
        id => "oracle-jdbc-input"
    
        add_field => { "[labels][application]" => "oracle12.1" }
        add_field => { "[labels][environment]" => "uat" }
        add_field => { "[labels][location]" => "beijing" }
        add_field => { "[labels][business]" => "jxoic" }
        add_field => { "[labels][pdb]" => "testdb" }
    
        add_field => { "[cloud][provider]" => "aws" }
        add_field => { "[cloud][region]" => "cn-north-1" }
    
        add_field => { "[host][ip]" => "192.168.1.68" }`
    },
    kafka: {
        config: `  codec => json
        bootstrap_servers => "192.168.1.68:9092,192.168.1.60:9092,192.168.1.61:9092"
        client_id=> "logstash_pipeline_syslog_input"
        security_protocol=> "PLAINTEXT"
        topics=> "syslog"
        consumer_threads => "1"
        group_id=> "logstash-1"
        decorate_events=> true`
    },
};
export default {
    'get /data/logstash/config': function (req, res) {
      
      setTimeout(() => {
        res.json(logstashConf);
      }, 1500);
    },
    'POST /data/logstash/config': (req, res) => {
        Object.assign(logstashConf, req.body);
        console.log(logstashConf,1);
        setTimeout(() => {
            res.send({ message: 'Ok' });
        },2000);
    },
  };
  