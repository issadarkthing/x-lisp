# X-lisp
X-lisp is a simple lisp interpreter. So far, everything is a 
function. 

This is general construct of the language `(name args args)`, 
the first argument inside parenthesis 
is the function name, and the subsequent is
the function arguments.

## Installation
Make sure you have **Deno** installed, if not you can install it [here](https://deno.land/#installation).
```sh
$ deno install --allow-read github.com/issadarkthing/x-lisp/xlisp.ts
```

## Data types (Kind)
Two major data type in x-lisp is `Fn` and `Kind`. `Fn` is function type which
takes at least one argument; the symbol. Everything with the parenthesis
is a `Fn` type. In fact, the whole module is a big `prog` function 
(we will talk about this later). Every `Fn` creates a new scope, the variables
defined inside `Fn` is only visible within `Fn`.

Primitive data types are `Kind`s. They are not callable and cannot be the first
item inside a `parenthesis`.
- string
- number
- nil
- boolean
- cons `list`

## Cons
Cons is a list and the only data structure _so far_ in the language. The cons function
is a variadic function which means it takes multiple arguments and returns a
cons.

## Math

| function       |  description                  |
| -------------  | ------------                  |
| ```(+ a b)```  | add numbers                   |
| ```(- a b)```  | subtract numbers              |
| ```(* a b)```  | multiply numbers              |
| ```(/ a b)```  | divide numbers                |

## Logical function

|   function      |  description               |
| -------------   | ------------               |
| ```(and a b)``` | and `&&`                   |
| ```(or a b)```  | or `\|\|`                  |
| ```(eq a b)```  | equal `==`                 |
| ```(ne a b)```  | not equal `!=`             |
| ```(gt a b)```  | greater then `>`           |
| ```(ge a b)```  | greater then or equal `>=` |
| ```(lt a b)```  | lesser then `<`            |
| ```(le a b)```  | lesser then or equal `<=`  |

## Function
`defun` is a function that takes 3 arguments: identifier, cons, function.
```lisp
(defun adder (# a b c)
	(+ a b c))
```

## Variable binding
`set` bind a `Kind` to a symbol. The symbol is visible inside the parent scope.
```lisp
(set a 10 b 12)
```

## Control flow (expression)
`if` is not a statement but rather a function which takes 3 `Fn` types. The first
argument must be an `Fn` that returns a bool `Kind`.
```lisp
(if (< 10 11)
	(id "so truee")
	(id "so wrong"))
```
Notice the `id` function, it is needed there because it needs to turn `Kind` type
to `Fn` type.


