
; (prog
;   (set a 12)
;   (prog 
; 	(set a 14)
; 	(print a))
;   (print a))


(defun fact (# a)
  (if (eq a 0)
	(id 1)
	(prog
	  (set newVar (- a 1))
	  (print a)
	  (set res (mul a (fact newVar)))
	  (print a)
	  (id res))))


(set b (fact 1))
(print (id "=>") b)


; (set a 12)

; (- a 12)

; (print a)
