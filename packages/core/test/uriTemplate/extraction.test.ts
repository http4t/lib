import {TemplateVars, UriTemplate} from "@http4t/core/UriTemplate";
import chai from 'chai';

const {expect} = chai;

function test<Template extends string>(template: Template, uri: string, expected: TemplateVars<Template>) {
    const ut = UriTemplate.of(template);

    console.log("Parts");
    console.log(JSON.stringify(ut.parts));
    console.log("\nUri");
    console.log(uri);
    console.log("\nExpected");
    console.log(expected);

    const actual = ut.extract(uri);
    console.log("\nActual");
    console.log(actual);
    
    expect(actual).deep.eq(expected)
}

describe('UriTemplate.extract()', function() {
   describe('Level 1 Examples', function() {
      it("{var}", () => test("{var}", "value", {"var":"value"}));

      it("'{var}'", () => test("'{var}'", "'value'", {"var":"value"}));

      it("{hello}", () => test("{hello}", "Hello%20World%21", {"hello":"Hello World!"}));

   })
   describe('Level 2 Examples', function() {
      it("{+var}", () => test("{+var}", "value", {"var":"value"}));

      it("{+hello}", () => test("{+hello}", "Hello%20World!", {"hello":"Hello World!"}));

      it("{+path}/here", () => test("{+path}/here", "/foo/bar/here", {"path":"/foo/bar"}));

      it("here?ref={+path}", () => test("here?ref={+path}", "here?ref=/foo/bar", {"path":"/foo/bar"}));

   })
   describe('Level 3 Examples', function() {
      it("map?{x,y}", () => test("map?{x,y}", "map?1024,768", {"x":"1024","y":"768"}));

      it("{x,hello,y}", () => test("{x,hello,y}", "1024,Hello%20World%21,768", {"x":"1024","hello":"Hello World!","y":"768"}));

      it("{+x,hello,y}", () => test("{+x,hello,y}", "1024,Hello%20World!,768", {"x":"1024","hello":"Hello World!","y":"768"}));

      it("{+path,x}/here", () => test("{+path,x}/here", "/foo/bar,1024/here", {"path":"/foo/bar","x":"1024"}));

      it("{#x,hello,y}", () => test("{#x,hello,y}", "#1024,Hello%20World!,768", {"x":"1024","hello":"Hello World!","y":"768"}));

      it("{#path,x}/here", () => test("{#path,x}/here", "#/foo/bar,1024/here", {"path":"/foo/bar","x":"1024"}));

      it("X{.var}", () => test("X{.var}", "X.value", {"var":"value"}));

      it("X{.x,y}", () => test("X{.x,y}", "X.1024.768", {"x":"1024","y":"768"}));

      it("{/var}", () => test("{/var}", "/value", {"var":"value"}));

      it("{/var,x}/here", () => test("{/var,x}/here", "/value/1024/here", {"var":"value","x":"1024"}));

      it("{;x,y}", () => test("{;x,y}", ";x=1024;y=768", {"x":"1024","y":"768"}));

      it("{;x,y,empty}", () => test("{;x,y,empty}", ";x=1024;y=768;empty", {"x":"1024","y":"768","empty":null}));

      it("{?x,y}", () => test("{?x,y}", "?x=1024&y=768", {"x":"1024","y":"768"}));

      it("{?x,y,empty}", () => test("{?x,y,empty}", "?x=1024&y=768&empty=", {"x":"1024","y":"768","empty":null}));

      it("?fixed=yes{&x}", () => test("?fixed=yes{&x}", "?fixed=yes&x=1024", {"x":"1024"}));

      it("{&x,y,empty}", () => test("{&x,y,empty}", "&x=1024&y=768&empty=", {"x":"1024","y":"768","empty":null}));

   })
   describe('Level 4 Examples', function() {
      it("{var:3}", () => test("{var:3}", "val", {"var":"value"}));

      it("{var:30}", () => test("{var:30}", "value", {"var":"value"}));

      it("{list}", () => test("{list}", "red,green,blue", {"list":["red","green","blue"]}));

      it("{list*}", () => test("{list*}", "red,green,blue", {"list":["red","green","blue"]}));

      it("{keys}", () => test("{keys}", "comma,%2C,dot,.,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys}", () => test("{keys}", "comma,%2C,semi,%3B,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys}", () => test("{keys}", "dot,.,comma,%2C,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys}", () => test("{keys}", "dot,.,semi,%3B,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys}", () => test("{keys}", "semi,%3B,comma,%2C,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys}", () => test("{keys}", "semi,%3B,dot,.,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys*}", () => test("{keys*}", "comma=%2C,dot=.,semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys*}", () => test("{keys*}", "comma=%2C,semi=%3B,dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys*}", () => test("{keys*}", "dot=.,comma=%2C,semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys*}", () => test("{keys*}", "dot=.,semi=%3B,comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys*}", () => test("{keys*}", "semi=%3B,comma=%2C,dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{keys*}", () => test("{keys*}", "semi=%3B,dot=.,comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+path:6}/here", () => test("{+path:6}/here", "/foo/b/here", {"path":"/foo/bar"}));

      it("{+list}", () => test("{+list}", "red,green,blue", {"list":["red","green","blue"]}));

      it("{+list*}", () => test("{+list*}", "red,green,blue", {"list":["red","green","blue"]}));

      it("{+keys}", () => test("{+keys}", "comma,,,dot,.,semi,;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys}", () => test("{+keys}", "comma,,,semi,;,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys}", () => test("{+keys}", "dot,.,comma,,,semi,;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys}", () => test("{+keys}", "dot,.,semi,;,comma,,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys}", () => test("{+keys}", "semi,;,comma,,,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys}", () => test("{+keys}", "semi,;,dot,.,comma,,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys*}", () => test("{+keys*}", "comma=,,dot=.,semi=;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys*}", () => test("{+keys*}", "comma=,,semi=;,dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys*}", () => test("{+keys*}", "dot=.,comma=,,semi=;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys*}", () => test("{+keys*}", "dot=.,semi=;,comma=,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys*}", () => test("{+keys*}", "semi=;,comma=,,dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{+keys*}", () => test("{+keys*}", "semi=;,dot=.,comma=,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#path:6}/here", () => test("{#path:6}/here", "#/foo/b/here", {"path":"/foo/bar"}));

      it("{#list}", () => test("{#list}", "#red,green,blue", {"list":["red","green","blue"]}));

      it("{#list*}", () => test("{#list*}", "#red,green,blue", {"list":["red","green","blue"]}));

      it("{#keys}", () => test("{#keys}", "#comma,,,dot,.,semi,;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys}", () => test("{#keys}", "#comma,,,semi,;,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys}", () => test("{#keys}", "#dot,.,comma,,,semi,;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys}", () => test("{#keys}", "#dot,.,semi,;,comma,,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys}", () => test("{#keys}", "#semi,;,comma,,,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys}", () => test("{#keys}", "#semi,;,dot,.,comma,,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys*}", () => test("{#keys*}", "#comma=,,dot=.,semi=;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys*}", () => test("{#keys*}", "#comma=,,semi=;,dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys*}", () => test("{#keys*}", "#dot=.,comma=,,semi=;", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys*}", () => test("{#keys*}", "#dot=.,semi=;,comma=,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys*}", () => test("{#keys*}", "#semi=;,comma=,,dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{#keys*}", () => test("{#keys*}", "#semi=;,dot=.,comma=,", {"keys":{"semi":";","dot":".","comma":","}}));

      it("X{.var:3}", () => test("X{.var:3}", "X.val", {"var":"value"}));

      it("X{.list}", () => test("X{.list}", "X.red,green,blue", {"list":["red","green","blue"]}));

      it("X{.list*}", () => test("X{.list*}", "X.red.green.blue", {"list":["red","green","blue"]}));

      it("X{.keys}", () => test("X{.keys}", "X.comma,%2C,dot,.,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("X{.keys}", () => test("X{.keys}", "X.comma,%2C,semi,%3B,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("X{.keys}", () => test("X{.keys}", "X.dot,.,comma,%2C,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("X{.keys}", () => test("X{.keys}", "X.dot,.,semi,%3B,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("X{.keys}", () => test("X{.keys}", "X.semi,%3B,comma,%2C,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("X{.keys}", () => test("X{.keys}", "X.semi,%3B,dot,.,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/var:1,var}", () => test("{/var:1,var}", "/v/value", {"var":"value"}));

      it("{/list}", () => test("{/list}", "/red,green,blue", {"list":["red","green","blue"]}));

      it("{/list*}", () => test("{/list*}", "/red/green/blue", {"list":["red","green","blue"]}));

      it("{/list*,path:4}", () => test("{/list*,path:4}", "/red/green/blue/%2Ffoo", {"list":["red","green","blue"],"path":"/foo/bar"}));

      it("{/keys}", () => test("{/keys}", "/comma,%2C,dot,.,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys}", () => test("{/keys}", "/comma,%2C,semi,%3B,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys}", () => test("{/keys}", "/dot,.,comma,%2C,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys}", () => test("{/keys}", "/dot,.,semi,%3B,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys}", () => test("{/keys}", "/semi,%3B,comma,%2C,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys}", () => test("{/keys}", "/semi,%3B,dot,.,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys*}", () => test("{/keys*}", "/comma=%2C/dot=./semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys*}", () => test("{/keys*}", "/comma=%2C/semi=%3B/dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys*}", () => test("{/keys*}", "/dot=./comma=%2C/semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys*}", () => test("{/keys*}", "/dot=./semi=%3B/comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys*}", () => test("{/keys*}", "/semi=%3B/comma=%2C/dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{/keys*}", () => test("{/keys*}", "/semi=%3B/dot=./comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;hello:5}", () => test("{;hello:5}", ";hello=Hello", {"hello":"Hello World!"}));

      it("{;list}", () => test("{;list}", ";list=red,green,blue", {"list":["red","green","blue"]}));

      it("{;list*}", () => test("{;list*}", ";list=red;list=green;list=blue", {"list":["red","green","blue"]}));

      it("{;keys}", () => test("{;keys}", ";keys=comma,%2C,dot,.,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys}", () => test("{;keys}", ";keys=comma,%2C,semi,%3B,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys}", () => test("{;keys}", ";keys=dot,.,comma,%2C,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys}", () => test("{;keys}", ";keys=dot,.,semi,%3B,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys}", () => test("{;keys}", ";keys=semi,%3B,comma,%2C,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys}", () => test("{;keys}", ";keys=semi,%3B,dot,.,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys*}", () => test("{;keys*}", ";comma=%2C;dot=.;semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys*}", () => test("{;keys*}", ";comma=%2C;semi=%3B;dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys*}", () => test("{;keys*}", ";dot=.;comma=%2C;semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys*}", () => test("{;keys*}", ";dot=.;semi=%3B;comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys*}", () => test("{;keys*}", ";semi=%3B;comma=%2C;dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{;keys*}", () => test("{;keys*}", ";semi=%3B;dot=.;comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?var:3}", () => test("{?var:3}", "?var=val", {"var":"val"}));

      it("{?list}", () => test("{?list}", "?list=red,green,blue", {"list":"red,green,blue"}));

      it("{?list*}", () => test("{?list*}", "?list=red&list=green&list=blue", {"list":["red","green","blue"]}));

      it("{?keys}", () => test("{?keys}", "?keys=comma,%2C,dot,.,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys}", () => test("{?keys}", "?keys=comma,%2C,semi,%3B,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys}", () => test("{?keys}", "?keys=dot,.,comma,%2C,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys}", () => test("{?keys}", "?keys=dot,.,semi,%3B,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys}", () => test("{?keys}", "?keys=semi,%3B,comma,%2C,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys}", () => test("{?keys}", "?keys=semi,%3B,dot,.,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys*}", () => test("{?keys*}", "?comma=%2C&dot=.&semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys*}", () => test("{?keys*}", "?comma=%2C&semi=%3B&dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys*}", () => test("{?keys*}", "?dot=.&comma=%2C&semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys*}", () => test("{?keys*}", "?dot=.&semi=%3B&comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys*}", () => test("{?keys*}", "?semi=%3B&comma=%2C&dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{?keys*}", () => test("{?keys*}", "?semi=%3B&dot=.&comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&var:3}", () => test("{&var:3}", "&var=val", {"var":"value"}));

      it("{&list}", () => test("{&list}", "&list=red,green,blue", {"list":["red","green","blue"]}));

      it("{&list*}", () => test("{&list*}", "&list=red&list=green&list=blue", {"list":["red","green","blue"]}));

      it("{&keys}", () => test("{&keys}", "&keys=comma,%2C,dot,.,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys}", () => test("{&keys}", "&keys=comma,%2C,semi,%3B,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys}", () => test("{&keys}", "&keys=dot,.,comma,%2C,semi,%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys}", () => test("{&keys}", "&keys=dot,.,semi,%3B,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys}", () => test("{&keys}", "&keys=semi,%3B,comma,%2C,dot,.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys}", () => test("{&keys}", "&keys=semi,%3B,dot,.,comma,%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys*}", () => test("{&keys*}", "&comma=%2C&dot=.&semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys*}", () => test("{&keys*}", "&comma=%2C&semi=%3B&dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys*}", () => test("{&keys*}", "&dot=.&comma=%2C&semi=%3B", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys*}", () => test("{&keys*}", "&dot=.&semi=%3B&comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys*}", () => test("{&keys*}", "&semi=%3B&comma=%2C&dot=.", {"keys":{"semi":";","dot":".","comma":","}}));

      it("{&keys*}", () => test("{&keys*}", "&semi=%3B&dot=.&comma=%2C", {"keys":{"semi":";","dot":".","comma":","}}));

   })
   describe('Additional Examples 1', function() {
      it("{/id*}", () => test("{/id*}", "/person", {"id":"person"}));

      it("{/id*}{?fields,first_name,last.name,token}", () => test("{/id*}{?fields,first_name,last.name,token}", "/person?fields=id,name,picture&first_name=John&last.name=Doe&token=12345", {"id":"person","fields":["id","name","picture"],"first_name":"John","last.name":"Doe","token":"12345"}));

      it("/search.{format}{?q,geocode,lang,locale,page,result_type}", () => test("/search.{format}{?q,geocode,lang,locale,page,result_type}", "/search.json?q=URI%20Templates&geocode=37.76,-122.427&lang=en&page=5", {"format":"json","q":"URI Templates","geocode":["37.76","-122.427"],"lang":"en","locale":null,"page":"5","result_type":null}));

      it("/test{/Some%20Thing}", () => test("/test{/Some%20Thing}", "/test/foo", {"Some%20Thing":"foo"}));

      it("/set{?number}", () => test("/set{?number}", "/set?number=6", {"number":"6"}));

      it("/loc{?long,lat}", () => test("/loc{?long,lat}", "/loc?long=37.76&lat=-122.427", {"long":"37.76","lat":"-122.427"}));

      it("/base{/group_id,first_name}/pages{/page,lang}{?format,q}", () => test("/base{/group_id,first_name}/pages{/page,lang}{?format,q}", "/base/12345/John/pages/5/en?format=json&q=URI%20Templates", {"group_id":"12345","first_name":"John","page":"5","lang":"en","format":"json","q":"URI Templates"}));

      it("/sparql{?query}", () => test("/sparql{?query}", "/sparql?query=PREFIX%20dc%3A%20%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E%20SELECT%20%3Fbook%20%3Fwho%20WHERE%20%7B%20%3Fbook%20dc%3Acreator%20%3Fwho%20%7D", {"query":"PREFIX dc: <http://purl.org/dc/elements/1.1/> SELECT ?book ?who WHERE { ?book dc:creator ?who }"}));

      it("/go{?uri}", () => test("/go{?uri}", "/go?uri=http%3A%2F%2Fexample.org%2F%3Furi%3Dhttp%253A%252F%252Fexample.org%252F", {"uri":"http://example.org/?uri=http%3A%2F%2Fexample.org%2F"}));

      it("/service{?word}", () => test("/service{?word}", "/service?word=dr%C3%BCcken", {"word":"drücken"}));

      it("/lookup{?Stra%C3%9Fe}", () => test("/lookup{?Stra%C3%9Fe}", "/lookup?Stra%C3%9Fe=Gr%C3%BCner%20Weg", {"Stra%C3%9Fe":"Grüner Weg"}));

      it("{random}", () => test("{random}", "%C5%A1%C3%B6%C3%A4%C5%B8%C5%93%C3%B1%C3%AA%E2%82%AC%C2%A3%C2%A5%E2%80%A1%C3%91%C3%92%C3%93%C3%94%C3%95%C3%96%C3%97%C3%98%C3%99%C3%9A%C3%A0%C3%A1%C3%A2%C3%A3%C3%A4%C3%A5%C3%A6%C3%A7%C3%BF", {"random":"šöäŸœñê€£¥‡ÑÒÓÔÕÖ×ØÙÚàáâãäåæçÿ"}));

      it("{?assoc_special_chars*}", () => test("{?assoc_special_chars*}", "?%C5%A1%C3%B6%C3%A4%C5%B8%C5%93%C3%B1%C3%AA%E2%82%AC%C2%A3%C2%A5%E2%80%A1%C3%91%C3%92%C3%93%C3%94%C3%95=%C3%96%C3%97%C3%98%C3%99%C3%9A%C3%A0%C3%A1%C3%A2%C3%A3%C3%A4%C3%A5%C3%A6%C3%A7%C3%BF", {"assoc_special_chars":{"šöäŸœñê€£¥‡ÑÒÓÔÕ":"Ö×ØÙÚàáâãäåæçÿ"}}));

   })
   describe('Additional Examples 2', function() {
      it("{/id*}", () => test("{/id*}", "/person/albums", {"id":["person","albums"]}));

      it("{/id*}{?fields,token}", () => test("{/id*}{?fields,token}", "/person/albums?fields=id,name,picture&token=12345", {"id":["person","albums"],"fields":["id","name","picture"],"token":"12345"}));

   })
   describe('Additional Examples 3: Empty Variables', function() {
      it("{/empty_list}", () => test("{/empty_list}", "", {"empty_list":[]}));

      it("{/empty_list*}", () => test("{/empty_list*}", "", {"empty_list":[]}));

      it("{?empty_list}", () => test("{?empty_list}", "", {"empty_list":[]}));

      it("{?empty_list*}", () => test("{?empty_list*}", "", {"empty_list":[]}));

      it("{?empty_assoc}", () => test("{?empty_assoc}", "", {"empty_assoc":{}}));

      it("{?empty_assoc*}", () => test("{?empty_assoc*}", "", {"empty_assoc":{}}));

   })
   describe('Additional Examples 4: Numeric Keys', function() {
      it("{42}", () => test("{42}", "The%20Answer%20to%20the%20Ultimate%20Question%20of%20Life%2C%20the%20Universe%2C%20and%20Everything", {"42":"The Answer to the Ultimate Question of Life, the Universe, and Everything"}));

      it("{?42}", () => test("{?42}", "?42=The%20Answer%20to%20the%20Ultimate%20Question%20of%20Life%2C%20the%20Universe%2C%20and%20Everything", {"42":"The Answer to the Ultimate Question of Life, the Universe, and Everything"}));

      it("{1337}", () => test("{1337}", "leet,as,it,can,be", {"1337":["leet","as","it","can","be"]}));

      it("{?1337*}", () => test("{?1337*}", "?1337=leet&1337=as&1337=it&1337=can&1337=be", {"1337":["leet","as","it","can","be"]}));

      it("{?german*}", () => test("{?german*}", "?11=elf&12=zw%C3%B6lf", {"german":{"11":"elf","12":"zwölf"}}));

      it("{?german*}", () => test("{?german*}", "?12=zw%C3%B6lf&11=elf", {"german":{"11":"elf","12":"zwölf"}}));

   })
   describe('Additional Examples 5: Explode Combinations', function() {
      it("{?id,token,keys*}", () => test("{?id,token,keys*}", "?id=admin&token=12345&key1=val1&key2=val2", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}));

      it("{?id,token,keys*}", () => test("{?id,token,keys*}", "?id=admin&token=12345&key2=val2&key1=val1", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}));

      it("{/id}{?token,keys*}", () => test("{/id}{?token,keys*}", "/admin?token=12345&key1=val1&key2=val2", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}));

      it("{/id}{?token,keys*}", () => test("{/id}{?token,keys*}", "/admin?token=12345&key2=val2&key1=val1", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}));

      it("{?id,token}{&keys*}", () => test("{?id,token}{&keys*}", "?id=admin&token=12345&key1=val1&key2=val2", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}));

      it("{?id,token}{&keys*}", () => test("{?id,token}{&keys*}", "?id=admin&token=12345&key2=val2&key1=val1", {"id":"admin","token":"12345","keys":{"key1":"val1","key2":"val2"}}));

      it("/user{/id}{?token,tab}{&keys*}", () => test("/user{/id}{?token,tab}{&keys*}", "/user/admin?token=12345&tab=overview&key1=val1&key2=val2", {"id":"admin","token":"12345","tab":"overview","keys":{"key1":"val1","key2":"val2"}}));

      it("/user{/id}{?token,tab}{&keys*}", () => test("/user{/id}{?token,tab}{&keys*}", "/user/admin?token=12345&tab=overview&key2=val2&key1=val1", {"id":"admin","token":"12345","tab":"overview","keys":{"key1":"val1","key2":"val2"}}));

   })
   describe('Additional Examples 6: Reserved Expansion', function() {
      it("{+id}", () => test("{+id}", "admin%2F", {"id":"admin%2F"}));

      it("{#id}", () => test("{#id}", "#admin%2F", {"id":"admin%2F"}));

      it("{id}", () => test("{id}", "admin%252F", {"id":"admin%2F"}));

      it("{+not_pct}", () => test("{+not_pct}", "%25foo", {"not_pct":"%foo"}));

      it("{#not_pct}", () => test("{#not_pct}", "#%25foo", {"not_pct":"%foo"}));

      it("{not_pct}", () => test("{not_pct}", "%25foo", {"not_pct":"%foo"}));

      it("{+list}", () => test("{+list}", "red%25,%2Fgreen,blue%20", {"list":["red%25","%2Fgreen","blue "]}));

      it("{#list}", () => test("{#list}", "#red%25,%2Fgreen,blue%20", {"list":["red%25","%2Fgreen","blue "]}));

      it("{list}", () => test("{list}", "red%2525,%252Fgreen,blue%20", {"list":["red%25","%2Fgreen","blue "]}));

      it("{+keys}", () => test("{+keys}", "key1,val1%2F,key2,val2%2F", {"keys":{"key1":"val1%2F","key2":"val2%2F"}}));

      it("{#keys}", () => test("{#keys}", "#key1,val1%2F,key2,val2%2F", {"keys":{"key1":"val1%2F","key2":"val2%2F"}}));

      it("{keys}", () => test("{keys}", "key1,val1%252F,key2,val2%252F", {"keys":{"key1":"val1%2F","key2":"val2%2F"}}));

   })
});