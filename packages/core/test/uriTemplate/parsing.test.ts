import chai from 'chai';
import {ParsedTemplate, UriTemplate} from "@http4t/core/UriTemplate"

const {expect} = chai;

function test<Template extends string>(template: Template, expected: ParsedTemplate<Template>) {
    expect(UriTemplate.of(template).parts).deep.eq(expected);
}
describe('Parsing output', function() {
   it("{var}", () => test("{var}", [{"vars":[{"name":"var"}]}]));

   it("'{var}'", () => test("'{var}'", ["'",{"vars":[{"name":"var"}]},"'"]));

   it("{hello}", () => test("{hello}", [{"vars":[{"name":"hello"}]}]));

   it("{+var}", () => test("{+var}", [{"vars":[{"name":"var"}],"operator":"+"}]));

   it("{+hello}", () => test("{+hello}", [{"vars":[{"name":"hello"}],"operator":"+"}]));

   it("{+path}/here", () => test("{+path}/here", [{"vars":[{"name":"path"}],"operator":"+"},"/here"]));

   it("here?ref={+path}", () => test("here?ref={+path}", ["here?ref=",{"vars":[{"name":"path"}],"operator":"+"}]));

   it("map?{x,y}", () => test("map?{x,y}", ["map?",{"vars":[{"name":"x"},{"name":"y"}]}]));

   it("{x,hello,y}", () => test("{x,hello,y}", [{"vars":[{"name":"x"},{"name":"hello"},{"name":"y"}]}]));

   it("{+x,hello,y}", () => test("{+x,hello,y}", [{"vars":[{"name":"x"},{"name":"hello"},{"name":"y"}],"operator":"+"}]));

   it("{+path,x}/here", () => test("{+path,x}/here", [{"vars":[{"name":"path"},{"name":"x"}],"operator":"+"},"/here"]));

   it("{#x,hello,y}", () => test("{#x,hello,y}", [{"vars":[{"name":"x"},{"name":"hello"},{"name":"y"}],"operator":"#"}]));

   it("{#path,x}/here", () => test("{#path,x}/here", [{"vars":[{"name":"path"},{"name":"x"}],"operator":"#"},"/here"]));

   it("X{.var}", () => test("X{.var}", ["X",{"vars":[{"name":"var"}],"operator":"."}]));

   it("X{.x,y}", () => test("X{.x,y}", ["X",{"vars":[{"name":"x"},{"name":"y"}],"operator":"."}]));

   it("{/var}", () => test("{/var}", [{"vars":[{"name":"var"}],"operator":"/"}]));

   it("{/var,x}/here", () => test("{/var,x}/here", [{"vars":[{"name":"var"},{"name":"x"}],"operator":"/"},"/here"]));

   it("{;x,y}", () => test("{;x,y}", [{"vars":[{"name":"x"},{"name":"y"}],"operator":";"}]));

   it("{;x,y,empty}", () => test("{;x,y,empty}", [{"vars":[{"name":"x"},{"name":"y"},{"name":"empty"}],"operator":";"}]));

   it("{?x,y}", () => test("{?x,y}", [{"vars":[{"name":"x"},{"name":"y"}],"operator":"?"}]));

   it("{?x,y,empty}", () => test("{?x,y,empty}", [{"vars":[{"name":"x"},{"name":"y"},{"name":"empty"}],"operator":"?"}]));

   it("?fixed=yes{&x}", () => test("?fixed=yes{&x}", ["?fixed=yes",{"vars":[{"name":"x"}],"operator":"&"}]));

   it("{&x,y,empty}", () => test("{&x,y,empty}", [{"vars":[{"name":"x"},{"name":"y"},{"name":"empty"}],"operator":"&"}]));

   it("{var:3}", () => test("{var:3}", [{"vars":[{"name":"var","modifier":{"type":":","count":3}}]}]));

   it("{var:30}", () => test("{var:30}", [{"vars":[{"name":"var","modifier":{"type":":","count":30}}]}]));

   it("{list}", () => test("{list}", [{"vars":[{"name":"list"}]}]));

   it("{list*}", () => test("{list*}", [{"vars":[{"name":"list","modifier":{"type":"*"}}]}]));

   it("{keys}", () => test("{keys}", [{"vars":[{"name":"keys"}]}]));

   it("{keys*}", () => test("{keys*}", [{"vars":[{"name":"keys","modifier":{"type":"*"}}]}]));

   it("{+path:6}/here", () => test("{+path:6}/here", [{"vars":[{"name":"path","modifier":{"type":":","count":6}}],"operator":"+"},"/here"]));

   it("{+list}", () => test("{+list}", [{"vars":[{"name":"list"}],"operator":"+"}]));

   it("{+list*}", () => test("{+list*}", [{"vars":[{"name":"list","modifier":{"type":"*"}}],"operator":"+"}]));

   it("{+keys}", () => test("{+keys}", [{"vars":[{"name":"keys"}],"operator":"+"}]));

   it("{+keys*}", () => test("{+keys*}", [{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":"+"}]));

   it("{#path:6}/here", () => test("{#path:6}/here", [{"vars":[{"name":"path","modifier":{"type":":","count":6}}],"operator":"#"},"/here"]));

   it("{#list}", () => test("{#list}", [{"vars":[{"name":"list"}],"operator":"#"}]));

   it("{#list*}", () => test("{#list*}", [{"vars":[{"name":"list","modifier":{"type":"*"}}],"operator":"#"}]));

   it("{#keys}", () => test("{#keys}", [{"vars":[{"name":"keys"}],"operator":"#"}]));

   it("{#keys*}", () => test("{#keys*}", [{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":"#"}]));

   it("X{.var:3}", () => test("X{.var:3}", ["X",{"vars":[{"name":"var","modifier":{"type":":","count":3}}],"operator":"."}]));

   it("X{.list}", () => test("X{.list}", ["X",{"vars":[{"name":"list"}],"operator":"."}]));

   it("X{.list*}", () => test("X{.list*}", ["X",{"vars":[{"name":"list","modifier":{"type":"*"}}],"operator":"."}]));

   it("X{.keys}", () => test("X{.keys}", ["X",{"vars":[{"name":"keys"}],"operator":"."}]));

   it("{/var:1,var}", () => test("{/var:1,var}", [{"vars":[{"name":"var","modifier":{"type":":","count":1}},{"name":"var"}],"operator":"/"}]));

   it("{/list}", () => test("{/list}", [{"vars":[{"name":"list"}],"operator":"/"}]));

   it("{/list*}", () => test("{/list*}", [{"vars":[{"name":"list","modifier":{"type":"*"}}],"operator":"/"}]));

   it("{/list*,path:4}", () => test("{/list*,path:4}", [{"vars":[{"name":"list","modifier":{"type":"*"}},{"name":"path","modifier":{"type":":","count":4}}],"operator":"/"}]));

   it("{/keys}", () => test("{/keys}", [{"vars":[{"name":"keys"}],"operator":"/"}]));

   it("{/keys*}", () => test("{/keys*}", [{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":"/"}]));

   it("{;hello:5}", () => test("{;hello:5}", [{"vars":[{"name":"hello","modifier":{"type":":","count":5}}],"operator":";"}]));

   it("{;list}", () => test("{;list}", [{"vars":[{"name":"list"}],"operator":";"}]));

   it("{;list*}", () => test("{;list*}", [{"vars":[{"name":"list","modifier":{"type":"*"}}],"operator":";"}]));

   it("{;keys}", () => test("{;keys}", [{"vars":[{"name":"keys"}],"operator":";"}]));

   it("{;keys*}", () => test("{;keys*}", [{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":";"}]));

   it("{?var:3}", () => test("{?var:3}", [{"vars":[{"name":"var","modifier":{"type":":","count":3}}],"operator":"?"}]));

   it("{?list}", () => test("{?list}", [{"vars":[{"name":"list"}],"operator":"?"}]));

   it("{?list*}", () => test("{?list*}", [{"vars":[{"name":"list","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{?keys}", () => test("{?keys}", [{"vars":[{"name":"keys"}],"operator":"?"}]));

   it("{?keys*}", () => test("{?keys*}", [{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{&var:3}", () => test("{&var:3}", [{"vars":[{"name":"var","modifier":{"type":":","count":3}}],"operator":"&"}]));

   it("{&list}", () => test("{&list}", [{"vars":[{"name":"list"}],"operator":"&"}]));

   it("{&list*}", () => test("{&list*}", [{"vars":[{"name":"list","modifier":{"type":"*"}}],"operator":"&"}]));

   it("{&keys}", () => test("{&keys}", [{"vars":[{"name":"keys"}],"operator":"&"}]));

   it("{&keys*}", () => test("{&keys*}", [{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":"&"}]));

   it("{/id*}", () => test("{/id*}", [{"vars":[{"name":"id","modifier":{"type":"*"}}],"operator":"/"}]));

   it("{/id*}{?fields,first_name,last.name,token}", () => test("{/id*}{?fields,first_name,last.name,token}", [{"vars":[{"name":"id","modifier":{"type":"*"}}],"operator":"/"},{"vars":[{"name":"fields"},{"name":"first_name"},{"name":"last.name"},{"name":"token"}],"operator":"?"}]));

   it("/search.{format}{?q,geocode,lang,locale,page,result_type}", () => test("/search.{format}{?q,geocode,lang,locale,page,result_type}", ["/search.",{"vars":[{"name":"format"}]},{"vars":[{"name":"q"},{"name":"geocode"},{"name":"lang"},{"name":"locale"},{"name":"page"},{"name":"result_type"}],"operator":"?"}]));

   it("/test{/Some%20Thing}", () => test("/test{/Some%20Thing}", ["/test",{"vars":[{"name":"Some%20Thing"}],"operator":"/"}]));

   it("/set{?number}", () => test("/set{?number}", ["/set",{"vars":[{"name":"number"}],"operator":"?"}]));

   it("/loc{?long,lat}", () => test("/loc{?long,lat}", ["/loc",{"vars":[{"name":"long"},{"name":"lat"}],"operator":"?"}]));

   it("/base{/group_id,first_name}/pages{/page,lang}{?format,q}", () => test("/base{/group_id,first_name}/pages{/page,lang}{?format,q}", ["/base",{"vars":[{"name":"group_id"},{"name":"first_name"}],"operator":"/"},"/pages",{"vars":[{"name":"page"},{"name":"lang"}],"operator":"/"},{"vars":[{"name":"format"},{"name":"q"}],"operator":"?"}]));

   it("/sparql{?query}", () => test("/sparql{?query}", ["/sparql",{"vars":[{"name":"query"}],"operator":"?"}]));

   it("/go{?uri}", () => test("/go{?uri}", ["/go",{"vars":[{"name":"uri"}],"operator":"?"}]));

   it("/service{?word}", () => test("/service{?word}", ["/service",{"vars":[{"name":"word"}],"operator":"?"}]));

   it("/lookup{?Stra%C3%9Fe}", () => test("/lookup{?Stra%C3%9Fe}", ["/lookup",{"vars":[{"name":"Stra%C3%9Fe"}],"operator":"?"}]));

   it("{random}", () => test("{random}", [{"vars":[{"name":"random"}]}]));

   it("{?assoc_special_chars*}", () => test("{?assoc_special_chars*}", [{"vars":[{"name":"assoc_special_chars","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{/id*}", () => test("{/id*}", [{"vars":[{"name":"id","modifier":{"type":"*"}}],"operator":"/"}]));

   it("{/id*}{?fields,token}", () => test("{/id*}{?fields,token}", [{"vars":[{"name":"id","modifier":{"type":"*"}}],"operator":"/"},{"vars":[{"name":"fields"},{"name":"token"}],"operator":"?"}]));

   it("{/empty_list}", () => test("{/empty_list}", [{"vars":[{"name":"empty_list"}],"operator":"/"}]));

   it("{/empty_list*}", () => test("{/empty_list*}", [{"vars":[{"name":"empty_list","modifier":{"type":"*"}}],"operator":"/"}]));

   it("{?empty_list}", () => test("{?empty_list}", [{"vars":[{"name":"empty_list"}],"operator":"?"}]));

   it("{?empty_list*}", () => test("{?empty_list*}", [{"vars":[{"name":"empty_list","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{?empty_assoc}", () => test("{?empty_assoc}", [{"vars":[{"name":"empty_assoc"}],"operator":"?"}]));

   it("{?empty_assoc*}", () => test("{?empty_assoc*}", [{"vars":[{"name":"empty_assoc","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{42}", () => test("{42}", [{"vars":[{"name":"42"}]}]));

   it("{?42}", () => test("{?42}", [{"vars":[{"name":"42"}],"operator":"?"}]));

   it("{1337}", () => test("{1337}", [{"vars":[{"name":"1337"}]}]));

   it("{?1337*}", () => test("{?1337*}", [{"vars":[{"name":"1337","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{?german*}", () => test("{?german*}", [{"vars":[{"name":"german","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{?id,token,keys*}", () => test("{?id,token,keys*}", [{"vars":[{"name":"id"},{"name":"token"},{"name":"keys","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{/id}{?token,keys*}", () => test("{/id}{?token,keys*}", [{"vars":[{"name":"id"}],"operator":"/"},{"vars":[{"name":"token"},{"name":"keys","modifier":{"type":"*"}}],"operator":"?"}]));

   it("{?id,token}{&keys*}", () => test("{?id,token}{&keys*}", [{"vars":[{"name":"id"},{"name":"token"}],"operator":"?"},{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":"&"}]));

   it("/user{/id}{?token,tab}{&keys*}", () => test("/user{/id}{?token,tab}{&keys*}", ["/user",{"vars":[{"name":"id"}],"operator":"/"},{"vars":[{"name":"token"},{"name":"tab"}],"operator":"?"},{"vars":[{"name":"keys","modifier":{"type":"*"}}],"operator":"&"}]));

   it("{+id}", () => test("{+id}", [{"vars":[{"name":"id"}],"operator":"+"}]));

   it("{#id}", () => test("{#id}", [{"vars":[{"name":"id"}],"operator":"#"}]));

   it("{id}", () => test("{id}", [{"vars":[{"name":"id"}]}]));

   it("{+not_pct}", () => test("{+not_pct}", [{"vars":[{"name":"not_pct"}],"operator":"+"}]));

   it("{#not_pct}", () => test("{#not_pct}", [{"vars":[{"name":"not_pct"}],"operator":"#"}]));

   it("{not_pct}", () => test("{not_pct}", [{"vars":[{"name":"not_pct"}]}]));

   it("{+list}", () => test("{+list}", [{"vars":[{"name":"list"}],"operator":"+"}]));

   it("{#list}", () => test("{#list}", [{"vars":[{"name":"list"}],"operator":"#"}]));

   it("{list}", () => test("{list}", [{"vars":[{"name":"list"}]}]));

   it("{+keys}", () => test("{+keys}", [{"vars":[{"name":"keys"}],"operator":"+"}]));

   it("{#keys}", () => test("{#keys}", [{"vars":[{"name":"keys"}],"operator":"#"}]));

   it("{keys}", () => test("{keys}", [{"vars":[{"name":"keys"}]}]));

});