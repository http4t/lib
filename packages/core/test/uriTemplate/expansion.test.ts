import {TemplateVars, UriTemplate} from "@http4t/core/UriTemplate";
import chai from 'chai';

const {expect} = chai;

function test<Template extends string>(template: Template, args: TemplateVars<Template>, expected: string | string[]) {
    const ut = UriTemplate.of(template);

    console.log(JSON.stringify(ut.parts));
    console.log(expected);
    console.log(args);

    const actual = ut.expand(args);
    console.log(actual);
    
    expect(actual).oneOf(typeof expected === "string" ? [expected] : expected);
}

describe('UriTemplate.expand()', function() {
   describe('Level 1 Examples', function() {
      it("{var}", () => test("{var}", {"var":"value"}, "value"));

      it("'{var}'", () => test("'{var}'", {"var":"value"}, "'value'"));

      it("{hello}", () => test("{hello}", {"hello":"Hello World!"}, "Hello%20World%21"));

   })
   describe('Level 2 Examples', function() {
      it("{+var}", () => test("{+var}", {"var":"value"}, "value"));

      it("{+hello}", () => test("{+hello}", {"hello":"Hello World!"}, "Hello%20World!"));

      it("{+path}/here", () => test("{+path}/here", {"path":"/foo/bar"}, "/foo/bar/here"));

      it("here?ref={+path}", () => test("here?ref={+path}", {"path":"/foo/bar"}, "here?ref=/foo/bar"));

   })
   describe('Level 3 Examples', function() {
      it("map?{x,y}", () => test("map?{x,y}", {"x":"1024","y":"768"}, "map?1024,768"));

      it("{x,hello,y}", () => test("{x,hello,y}", {"x":"1024","hello":"Hello World!","y":"768"}, "1024,Hello%20World%21,768"));

      it("{+x,hello,y}", () => test("{+x,hello,y}", {"x":"1024","hello":"Hello World!","y":"768"}, "1024,Hello%20World!,768"));

      it("{+path,x}/here", () => test("{+path,x}/here", {"path":"/foo/bar","x":"1024"}, "/foo/bar,1024/here"));

      it("{#x,hello,y}", () => test("{#x,hello,y}", {"x":"1024","hello":"Hello World!","y":"768"}, "#1024,Hello%20World!,768"));

      it("{#path,x}/here", () => test("{#path,x}/here", {"path":"/foo/bar","x":"1024"}, "#/foo/bar,1024/here"));

      it("X{.var}", () => test("X{.var}", {"var":"value"}, "X.value"));

      it("X{.x,y}", () => test("X{.x,y}", {"x":"1024","y":"768"}, "X.1024.768"));

      it("{/var}", () => test("{/var}", {"var":"value"}, "/value"));

      it("{/var,x}/here", () => test("{/var,x}/here", {"var":"value","x":"1024"}, "/value/1024/here"));

      it("{;x,y}", () => test("{;x,y}", {"x":"1024","y":"768"}, ";x=1024;y=768"));

      it("{;x,y,empty}", () => test("{;x,y,empty}", {"x":"1024","y":"768","empty":null}, ";x=1024;y=768;empty"));

      it("{?x,y}", () => test("{?x,y}", {"x":"1024","y":"768"}, "?x=1024&y=768"));

      it("{?x,y,empty}", () => test("{?x,y,empty}", {"x":"1024","y":"768","empty":null}, "?x=1024&y=768&empty="));

      it("?fixed=yes{&x}", () => test("?fixed=yes{&x}", {"x":"1024"}, "?fixed=yes&x=1024"));

      it("{&x,y,empty}", () => test("{&x,y,empty}", {"x":"1024","y":"768","empty":null}, "&x=1024&y=768&empty="));

   })
   describe('Level 4 Examples', function() {
      it("{var:3}", () => test("{var:3}", {"var":"value"}, "val"));

      it("{var:30}", () => test("{var:30}", {"var":"value"}, "value"));

      it("{list}", () => test("{list}", {"list":["red","green","blue"]}, "red,green,blue"));

      it("{list*}", () => test("{list*}", {"list":["red","green","blue"]}, "red,green,blue"));

      it("{keys}", () => test("{keys}", {"keys":{"semi":";","dot":".","comma":","}}, ["comma,%2C,dot,.,semi,%3B","comma,%2C,semi,%3B,dot,.","dot,.,comma,%2C,semi,%3B","dot,.,semi,%3B,comma,%2C","semi,%3B,comma,%2C,dot,.","semi,%3B,dot,.,comma,%2C"]));

      it("{keys*}", () => test("{keys*}", {"keys":{"semi":";","dot":".","comma":","}}, ["comma=%2C,dot=.,semi=%3B","comma=%2C,semi=%3B,dot=.","dot=.,comma=%2C,semi=%3B","dot=.,semi=%3B,comma=%2C","semi=%3B,comma=%2C,dot=.","semi=%3B,dot=.,comma=%2C"]));

      it("{+path:6}/here", () => test("{+path:6}/here", {"path":"/foo/bar"}, "/foo/b/here"));

      it("{+list}", () => test("{+list}", {"list":["red","green","blue"]}, "red,green,blue"));

      it("{+list*}", () => test("{+list*}", {"list":["red","green","blue"]}, "red,green,blue"));

      it("{+keys}", () => test("{+keys}", {"keys":{"semi":";","dot":".","comma":","}}, ["comma,,,dot,.,semi,;","comma,,,semi,;,dot,.","dot,.,comma,,,semi,;","dot,.,semi,;,comma,,","semi,;,comma,,,dot,.","semi,;,dot,.,comma,,"]));

      it("{+keys*}", () => test("{+keys*}", {"keys":{"semi":";","dot":".","comma":","}}, ["comma=,,dot=.,semi=;","comma=,,semi=;,dot=.","dot=.,comma=,,semi=;","dot=.,semi=;,comma=,","semi=;,comma=,,dot=.","semi=;,dot=.,comma=,"]));

      it("{#path:6}/here", () => test("{#path:6}/here", {"path":"/foo/bar"}, "#/foo/b/here"));

      it("{#list}", () => test("{#list}", {"list":["red","green","blue"]}, "#red,green,blue"));

      it("{#list*}", () => test("{#list*}", {"list":["red","green","blue"]}, "#red,green,blue"));

      it("{#keys}", () => test("{#keys}", {"keys":{"semi":";","dot":".","comma":","}}, ["#comma,,,dot,.,semi,;","#comma,,,semi,;,dot,.","#dot,.,comma,,,semi,;","#dot,.,semi,;,comma,,","#semi,;,comma,,,dot,.","#semi,;,dot,.,comma,,"]));

      it("{#keys*}", () => test("{#keys*}", {"keys":{"semi":";","dot":".","comma":","}}, ["#comma=,,dot=.,semi=;","#comma=,,semi=;,dot=.","#dot=.,comma=,,semi=;","#dot=.,semi=;,comma=,","#semi=;,comma=,,dot=.","#semi=;,dot=.,comma=,"]));

      it("X{.var:3}", () => test("X{.var:3}", {"var":"value"}, "X.val"));

      it("X{.list}", () => test("X{.list}", {"list":["red","green","blue"]}, "X.red,green,blue"));

      it("X{.list*}", () => test("X{.list*}", {"list":["red","green","blue"]}, "X.red.green.blue"));

      it("X{.keys}", () => test("X{.keys}", {"keys":{"semi":";","dot":".","comma":","}}, ["X.comma,%2C,dot,.,semi,%3B","X.comma,%2C,semi,%3B,dot,.","X.dot,.,comma,%2C,semi,%3B","X.dot,.,semi,%3B,comma,%2C","X.semi,%3B,comma,%2C,dot,.","X.semi,%3B,dot,.,comma,%2C"]));

      it("{/var:1,var}", () => test("{/var:1,var}", {"var":"value"}, "/v/value"));

      it("{/list}", () => test("{/list}", {"list":["red","green","blue"]}, "/red,green,blue"));

      it("{/list*}", () => test("{/list*}", {"list":["red","green","blue"]}, "/red/green/blue"));

      it("{/list*,path:4}", () => test("{/list*,path:4}", {"list":["red","green","blue"],"path":"/foo/bar"}, "/red/green/blue/%2Ffoo"));

      it("{/keys}", () => test("{/keys}", {"keys":{"semi":";","dot":".","comma":","}}, ["/comma,%2C,dot,.,semi,%3B","/comma,%2C,semi,%3B,dot,.","/dot,.,comma,%2C,semi,%3B","/dot,.,semi,%3B,comma,%2C","/semi,%3B,comma,%2C,dot,.","/semi,%3B,dot,.,comma,%2C"]));

      it("{/keys*}", () => test("{/keys*}", {"keys":{"semi":";","dot":".","comma":","}}, ["/comma=%2C/dot=./semi=%3B","/comma=%2C/semi=%3B/dot=.","/dot=./comma=%2C/semi=%3B","/dot=./semi=%3B/comma=%2C","/semi=%3B/comma=%2C/dot=.","/semi=%3B/dot=./comma=%2C"]));

      it("{;hello:5}", () => test("{;hello:5}", {"hello":"Hello World!"}, ";hello=Hello"));

      it("{;list}", () => test("{;list}", {"list":["red","green","blue"]}, ";list=red,green,blue"));

      it("{;list*}", () => test("{;list*}", {"list":["red","green","blue"]}, ";list=red;list=green;list=blue"));

      it("{;keys}", () => test("{;keys}", {"keys":{"semi":";","dot":".","comma":","}}, [";keys=comma,%2C,dot,.,semi,%3B",";keys=comma,%2C,semi,%3B,dot,.",";keys=dot,.,comma,%2C,semi,%3B",";keys=dot,.,semi,%3B,comma,%2C",";keys=semi,%3B,comma,%2C,dot,.",";keys=semi,%3B,dot,.,comma,%2C"]));

      it("{;keys*}", () => test("{;keys*}", {"keys":{"semi":";","dot":".","comma":","}}, [";comma=%2C;dot=.;semi=%3B",";comma=%2C;semi=%3B;dot=.",";dot=.;comma=%2C;semi=%3B",";dot=.;semi=%3B;comma=%2C",";semi=%3B;comma=%2C;dot=.",";semi=%3B;dot=.;comma=%2C"]));

      it("{?var:3}", () => test("{?var:3}", {"var":"value"}, "?var=val"));

      it("{?list}", () => test("{?list}", {"list":["red","green","blue"]}, "?list=red,green,blue"));

      it("{?list*}", () => test("{?list*}", {"list":["red","green","blue"]}, "?list=red&list=green&list=blue"));

      it("{?keys}", () => test("{?keys}", {"keys":{"semi":";","dot":".","comma":","}}, ["?keys=comma,%2C,dot,.,semi,%3B","?keys=comma,%2C,semi,%3B,dot,.","?keys=dot,.,comma,%2C,semi,%3B","?keys=dot,.,semi,%3B,comma,%2C","?keys=semi,%3B,comma,%2C,dot,.","?keys=semi,%3B,dot,.,comma,%2C"]));

      it("{?keys*}", () => test("{?keys*}", {"keys":{"semi":";","dot":".","comma":","}}, ["?comma=%2C&dot=.&semi=%3B","?comma=%2C&semi=%3B&dot=.","?dot=.&comma=%2C&semi=%3B","?dot=.&semi=%3B&comma=%2C","?semi=%3B&comma=%2C&dot=.","?semi=%3B&dot=.&comma=%2C"]));

      it("{&var:3}", () => test("{&var:3}", {"var":"value"}, "&var=val"));

      it("{&list}", () => test("{&list}", {"list":["red","green","blue"]}, "&list=red,green,blue"));

      it("{&list*}", () => test("{&list*}", {"list":["red","green","blue"]}, "&list=red&list=green&list=blue"));

      it("{&keys}", () => test("{&keys}", {"keys":{"semi":";","dot":".","comma":","}}, ["&keys=comma,%2C,dot,.,semi,%3B","&keys=comma,%2C,semi,%3B,dot,.","&keys=dot,.,comma,%2C,semi,%3B","&keys=dot,.,semi,%3B,comma,%2C","&keys=semi,%3B,comma,%2C,dot,.","&keys=semi,%3B,dot,.,comma,%2C"]));

      it("{&keys*}", () => test("{&keys*}", {"keys":{"semi":";","dot":".","comma":","}}, ["&comma=%2C&dot=.&semi=%3B","&comma=%2C&semi=%3B&dot=.","&dot=.&comma=%2C&semi=%3B","&dot=.&semi=%3B&comma=%2C","&semi=%3B&comma=%2C&dot=.","&semi=%3B&dot=.&comma=%2C"]));

   })
   describe('Additional Examples 1', function() {
      it("{/id*}", () => test("{/id*}", {"id":"person"}, "/person"));

      it("{/id*}{?fields,first_name,last.name,token}", () => test("{/id*}{?fields,first_name,last.name,token}", {"id":"person","fields":["id","name","picture"],"first_name":"John","last.name":"Doe","token":"12345"}, "/person?fields=id,name,picture&first_name=John&last.name=Doe&token=12345"));

      it("/search.{format}{?q,geocode,lang,locale,page,result_type}", () => test("/search.{format}{?q,geocode,lang,locale,page,result_type}", {"format":"json","q":"URI Templates","geocode":["37.76","-122.427"],"lang":"en","locale":null,"page":"5","result_type":null}, "/search.json?q=URI%20Templates&geocode=37.76,-122.427&lang=en&page=5"));

      it("/test{/Some%20Thing}", () => test("/test{/Some%20Thing}", {"Some%20Thing":"foo"}, "/test/foo"));

      it("/set{?number}", () => test("/set{?number}", {"number":6}, "/set?number=6"));

      it("/loc{?long,lat}", () => test("/loc{?long,lat}", {"long":37.76,"lat":-122.427}, "/loc?long=37.76&lat=-122.427"));

      it("/base{/group_id,first_name}/pages{/page,lang}{?format,q}", () => test("/base{/group_id,first_name}/pages{/page,lang}{?format,q}", {"group_id":"12345","first_name":"John","page":"5","lang":"en","format":"json","q":"URI Templates"}, "/base/12345/John/pages/5/en?format=json&q=URI%20Templates"));

      it("/sparql{?query}", () => test("/sparql{?query}", {"query":"PREFIX dc: <http://purl.org/dc/elements/1.1/> SELECT ?book ?who WHERE { ?book dc:creator ?who }"}, "/sparql?query=PREFIX%20dc%3A%20%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E%20SELECT%20%3Fbook%20%3Fwho%20WHERE%20%7B%20%3Fbook%20dc%3Acreator%20%3Fwho%20%7D"));

      it("/go{?uri}", () => test("/go{?uri}", {"uri":"http://example.org/?uri=http%3A%2F%2Fexample.org%2F"}, "/go?uri=http%3A%2F%2Fexample.org%2F%3Furi%3Dhttp%253A%252F%252Fexample.org%252F"));

      it("/service{?word}", () => test("/service{?word}", {"word":"drücken"}, "/service?word=dr%C3%BCcken"));

      it("/lookup{?Stra%C3%9Fe}", () => test("/lookup{?Stra%C3%9Fe}", {"Stra%C3%9Fe":"Grüner Weg"}, "/lookup?Stra%C3%9Fe=Gr%C3%BCner%20Weg"));

      it("{random}", () => test("{random}", {"random":"šöäŸœñê€£¥‡ÑÒÓÔÕÖ×ØÙÚàáâãäåæçÿ"}, "%C5%A1%C3%B6%C3%A4%C5%B8%C5%93%C3%B1%C3%AA%E2%82%AC%C2%A3%C2%A5%E2%80%A1%C3%91%C3%92%C3%93%C3%94%C3%95%C3%96%C3%97%C3%98%C3%99%C3%9A%C3%A0%C3%A1%C3%A2%C3%A3%C3%A4%C3%A5%C3%A6%C3%A7%C3%BF"));

      it("{?assoc_special_chars*}", () => test("{?assoc_special_chars*}", {"assoc_special_chars":{"šöäŸœñê€£¥‡ÑÒÓÔÕ":"Ö×ØÙÚàáâãäåæçÿ"}}, "?%C5%A1%C3%B6%C3%A4%C5%B8%C5%93%C3%B1%C3%AA%E2%82%AC%C2%A3%C2%A5%E2%80%A1%C3%91%C3%92%C3%93%C3%94%C3%95=%C3%96%C3%97%C3%98%C3%99%C3%9A%C3%A0%C3%A1%C3%A2%C3%A3%C3%A4%C3%A5%C3%A6%C3%A7%C3%BF"));

   })
   describe('Additional Examples 2', function() {
      it("{/id*}", () => test("{/id*}", {"id":["person","albums"]}, "/person/albums"));

      it("{/id*}{?fields,token}", () => test("{/id*}{?fields,token}", {"id":["person","albums"],"fields":["id","name","picture"],"token":"12345"}, "/person/albums?fields=id,name,picture&token=12345"));

   })
   describe('Additional Examples 3: Empty Variables', function() {
      it("{/empty_list}", () => test("{/empty_list}", {"empty_list":[]}, [""]));

      it("{/empty_list*}", () => test("{/empty_list*}", {"empty_list":[]}, [""]));

      it("{?empty_list}", () => test("{?empty_list}", {"empty_list":[]}, [""]));

      it("{?empty_list*}", () => test("{?empty_list*}", {"empty_list":[]}, [""]));

      it("{?empty_assoc}", () => test("{?empty_assoc}", {"empty_assoc":{}}, [""]));

      it("{?empty_assoc*}", () => test("{?empty_assoc*}", {"empty_assoc":{}}, [""]));

   })
   describe('Additional Examples 4: Numeric Keys', function() {
      it("{42}", () => test("{42}", {"42":"The Answer to the Ultimate Question of Life, the Universe, and Everything"}, "The%20Answer%20to%20the%20Ultimate%20Question%20of%20Life%2C%20the%20Universe%2C%20and%20Everything"));

      it("{?42}", () => test("{?42}", {"42":"The Answer to the Ultimate Question of Life, the Universe, and Everything"}, "?42=The%20Answer%20to%20the%20Ultimate%20Question%20of%20Life%2C%20the%20Universe%2C%20and%20Everything"));

      it("{1337}", () => test("{1337}", {"1337":["leet","as","it","can","be"]}, "leet,as,it,can,be"));

      it("{?1337*}", () => test("{?1337*}", {"1337":["leet","as","it","can","be"]}, "?1337=leet&1337=as&1337=it&1337=can&1337=be"));

      it("{?german*}", () => test("{?german*}", {"german":{"11":"elf","12":"zwölf"}}, ["?11=elf&12=zw%C3%B6lf","?12=zw%C3%B6lf&11=elf"]));

   })
   describe('Additional Examples 5: Explode Combinations', function() {
      it("{?id,token,keys*}", () => test("{?id,token,keys*}", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}, ["?id=admin&token=12345&key1=val1&key2=val2","?id=admin&token=12345&key2=val2&key1=val1"]));

      it("{/id}{?token,keys*}", () => test("{/id}{?token,keys*}", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}, ["/admin?token=12345&key1=val1&key2=val2","/admin?token=12345&key2=val2&key1=val1"]));

      it("{?id,token}{&keys*}", () => test("{?id,token}{&keys*}", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}, ["?id=admin&token=12345&key1=val1&key2=val2","?id=admin&token=12345&key2=val2&key1=val1"]));

      it("/user{/id}{?token,tab}{&keys*}", () => test("/user{/id}{?token,tab}{&keys*}", {"id":"admin","token":"12345","tab":"overview","keys":{"key1":"val1","key2":"val2"}}, ["/user/admin?token=12345&tab=overview&key1=val1&key2=val2","/user/admin?token=12345&tab=overview&key2=val2&key1=val1"]));

   })
   describe('Additional Examples 6: Reserved Expansion', function() {
      it("{+id}", () => test("{+id}", {"id":"admin%2F"}, "admin%2F"));

      it("{#id}", () => test("{#id}", {"id":"admin%2F"}, "#admin%2F"));

      it("{id}", () => test("{id}", {"id":"admin%2F"}, "admin%252F"));

      it("{+not_pct}", () => test("{+not_pct}", {"not_pct":"%foo"}, "%25foo"));

      it("{#not_pct}", () => test("{#not_pct}", {"not_pct":"%foo"}, "#%25foo"));

      it("{not_pct}", () => test("{not_pct}", {"not_pct":"%foo"}, "%25foo"));

      it("{+list}", () => test("{+list}", {"list":["red%25","%2Fgreen","blue "]}, "red%25,%2Fgreen,blue%20"));

      it("{#list}", () => test("{#list}", {"list":["red%25","%2Fgreen","blue "]}, "#red%25,%2Fgreen,blue%20"));

      it("{list}", () => test("{list}", {"list":["red%25","%2Fgreen","blue "]}, "red%2525,%252Fgreen,blue%20"));

      it("{+keys}", () => test("{+keys}", {"keys":{"key1":"val1%2F","key2":"val2%2F"}}, "key1,val1%2F,key2,val2%2F"));

      it("{#keys}", () => test("{#keys}", {"keys":{"key1":"val1%2F","key2":"val2%2F"}}, "#key1,val1%2F,key2,val2%2F"));

      it("{keys}", () => test("{keys}", {"keys":{"key1":"val1%2F","key2":"val2%2F"}}, "key1,val1%252F,key2,val2%252F"));

   })
});