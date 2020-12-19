title: Advent of Code 2020
published: 2020/12/19

---

I started writing a journal of how I solved each day of Advent of Code in a work Slack channel, but thought it might be nice to put here as well!

Learn about what [Advent of Code is here](https://adventofcode.com/2020/about). Find all of my solutions [here](https://github.com/lwakefield/advent-of-code/tree/master/2020). 

## Day 01

A nice easy warm up! I was able to use Crystal's `each_permutation` method, which made the extension a one character edit, but I have no idea as to the performance:

```
numbers = File.read_lines("day_01.txt").map(&.to_i)
numbers.each_combination(2) do |combination|
    if combination.sum == 2020
        puts "part 1: #{combination.join(" + ")} = 2020"
        puts "part 2: #{combination.join(" * ")} = #{combination.product}"
    end
end
```

## Day 02

Still heating up! I was slowed down by part 2 due to misreading the instructions (I thought 1-5 was a range, not positions 1 and 5). I built up a count map for part 1, half expecting it to be useful in part 2, but alas.

```
def is_valid_part_one (min, max, char, password)
    counts = {} of Char => Int32
    password.chars.each do |c|
        counts[c] ||= 0
        counts[c] += 1
    end
    counts[char]? && counts[char] >= min && counts[char] <= max
end
def is_valid_part_two (min, max, char, password)
    (password[min - 1]? == char) ^ (password[max - 1]? == char)
end
valid_count_part_one = 0
valid_count_part_two = 0
File.read_lines("day_02.txt").each do |line|
    match = line.match /(?<min>\d+)-(?<max>\d+) (?<char>\w): (?<password>\w+)/
    match = match.not_nil!
    min = match["min"].to_i
    max = match["max"].to_i
    char = match["char"].chars.first # there should only be one
    password = match["password"]
    valid_count_part_one += 1 if is_valid_part_one(min, max, char, password)
    valid_count_part_two += 1 if is_valid_part_two(min, max, char, password)
end
puts valid_count_part_one
puts valid_count_part_two
```

## Day 03

Simple enough! I feel like I could have come up with a more elegant solution, so I am looking forward to seeing what y'all came up with.

## Day 04

Instructions and solution seemed clear to me! I did need to go bug hunting for the second part (hence the `puts`). It turned out I wasn't being restrictive enough on the regex, which [I fixed by adding the `^` and `$`](https://github.com/lwakefield/advent-of-code/blob/master/2020/day_04.cr#L51).

The `not_nil!` statements are to force the typechecker to understand they cannot be nil at this point. [technically does this already](https://github.com/lwakefield/advent-of-code/blob/master/2020/day_04.cr#L26), but the compiler isn't quite smart enough to work that out.

## Day 05

I started off using [ranges](https://crystal-lang.org/reference/syntax_and_semantics/literals/range.html) to represent the row/col ranges which looks good syntactically, but ended up being harder to work with. So I switched to regular ol' min/max variables.
I got a little tripped on the +/- offset when doing the BSP but the test cases made it pretty clear what needed to happen.
I did not add validation on the `row_start == row_end,` so I suppose if the dataset was messier that would have cost me.
And for part 2, I thought the algorithmic solution was going to be a little fiddly. So instead, I printed the seats to screen and solved graphically.
Anyway, [good fun](https://github.com/lwakefield/advent-of-code/blob/master/2020/day_05.cr)! The solution was clear to me, but there were enough "gotchas" and design decisions along the way to make it an interesting problem.

Laying in bed thinking about the problem beforehand, I was thinking about a solution with bit-bashing, but couldn't see the solution clearly. [This](https://github.com/sophiebits/adventofcode/blob/main/2020/day05.py#L12-L15) is what I wanted  to do.
Flicking through the reddit thread (sorting by oldest), the first solvers use the binary solution and the further back you go, the more solutions start to look like mine.
Not that I was racing, but definitely goes to show how valuable "the trick" was.

## Day 06

```
groups = File.read("day_06.txt").split("\n\n").map do |lines|
    counts = {} of Char => Int32
    lines.chars.each do |c|
        next if c.whitespace?
        counts[c] ||= 0
        counts[c] += 1
    end
    { lines.lines.size, counts }
end
puts groups.map{ |g| g[1].size }.sum
puts(groups.map do |group_size, counts|
    counts.values.select { |v| v == group_size }.size
end.sum)
```

I typed part 1 out with no syntax errors or bugs, so it ran correctly first go which is rare!
I chose to build up a count map in part 1 thinking it might be useful it part 2, which it did!
No optimization, but the wall time sat at 6ms. Until we are looking at problems that take >10m to run (there have been some in previous years), I'm going to continue to ignoring any optimizations.

## Day 07

Today felt like a notable step up in difficulty for me!
It took longer than I would have liked to get the strings parsing correctly.
I used some node/edges code that I had already written which may have saved me a little bit of time. But ultimately, I messed up the graph traversal for both parts leading to infinite recursion.
This was also the first time I have used the examples provided for testing.
In the end, I came out with ~60 LoC (ignoring code I had already written) which I feel pretty good about.

## Day 08

This was fun!
Because Crystal is typed, I wanted the NOP instructions to have a zero argument for typing sake. I was expecting to have a small amount of code to handle that, but it turned out all NOPs had arguments anyhow!
I didn't know how hard part 2 was going to be so I wanted to start with a brute force solution which made me refactor code from part 1 into a def run_prog function. The first couple of runs didn't work, so I pulled in the example to debug and found a small bug. It took a total of 26s to check all options, but ultimately only took ~5s to spit out the answer. I probably could have decreased the max_ticks param, but wasn't certain how complicated the programs were going to be. Though now that I think about it, the programs are not self modifying, or even configurable so they should take at most instructions.size ticks to run...

## Day 09

I realized for part 1, that it would probably be easier to check whether each chunk was valid against the next index instead of "go to index 26, then fetch `chunk[0..25]` and check if it is valid for index 26".
Reading that sentence back, they seem almost identical in approach, but conceptually it made it much easier for me.
In the end `combinations` and `each_cons` made the overall problem super easy (though Dennis pointed out earlier that combinations is not a fast implementation).
I would have liked an `each_cons_with_index` function, but I am now realizing that I could tidy up part 1 by using an `each_cons(chunk_size+1)`.
edit: I re-wrote part 1 and it does make it prettier!

```
chunk_size = 25
numbers.each_cons(chunk_size + 1) do |chunk|
    valid_pair = chunk[..-2].combinations(2).find do |pair|
        pair.sum == chunk[-1]
    end
    puts "invalid number #{chunk[-1]}" unless valid_pair
end
```

## Day 10

Part 1 was chill. Part 2... was not. I am going to have to come back to part 2 this evening : \

```
numbers = File.read_lines("day_10.txt").map(&.to_i).sort
differentials = {} of Int32 => Int32
([0] + numbers + [numbers.last + 3]).each_cons(2) do |pair|
  diff = pair[1] - pair[0]
  differentials[diff] ||= 0
  differentials[diff] += 1
end
puts differentials[1] * differentials[3]
```

I should have finished reading the question, which would have served as a hint that a recursive solution that returns all chains in memory, won't work (without a big enough computer at least).

![Screenshot from 2020-12-10 06-51-32](https://user-images.githubusercontent.com/5688923/102698322-7d0c5b00-420a-11eb-822a-338c6517d9e1.png)
![Screenshot from 2020-12-10 06-50-24](https://user-images.githubusercontent.com/5688923/102698323-7d0c5b00-420a-11eb-9292-d902bf118659.png)

It ended up not being so bad: graphs and some caching, ended up with a sub millisecond runtime

## Day 11

I think I slowed myself down by re-using a grid class that I had previously written.
Conceptually part 1 and 2 were fine, but the code was kind of cumbersome to write with lots of places for bugs.

I wasn't satisfied with my original implementation, so I rewrote it without reusing `grid.cr`. Ultimately it came out to less LoC which was satisfying!
Ruby/Crystal wrap around indexing (`arr[-1] # last val`) is nice, but I wish there was also a function that would return or raise when the index was out of bounds.
Also fun note: semi colons can still be used to delimit statements in ruby allowing you to write `x += dx; y += dy` which I find a little easier to read than spreading it over two lines. Dunno if I would advise doing that in a shared codebase, but it felt right in a personal codebase.

## Day 12

It took me a while to commit to an implementation for the `rotate` function. I needed to brush up on trig if I wanted to do it completely, but as I started reading, I realized it would be easier to handle the 3/6 cases that existed (which I proved by `grep 'L|R' day_12.txt | sort -u`).
Here is the real kicker though. For part 1, I had somehow flipped both N/S and the L/R directions (what a dummy), which apparently resulted in a correct answer for part 1. However when I went onto part 2, I kept on getting an integer overflow and it took me a while to trace down the error.
In the end part 2 was a very minor modification of part 1, only two lines needed changing.

## Day 13

hrmmm - well part 1 was fine.
Part 2 I identified as a "combination breaking" problem. Brute forcing isn't an option, so I came up with (what I thought was smart) a code cracking algorithm like what you see in hacker movies, where it finds the first part of the combination, then the second and so on.
Not fast enough though, so I need to rethink what is going on here...

I think I overcomplicated the problem, confused myself and wrote bad code in the end.
I rewrote it with the same approach and got an answer <1ms.

## Day 14

I spent most of the time juggling data types: int -> binary -> string and back again.
I reckon I could tidy up my code and shave off maybe ~20 lines. But in the end, it worked!
I used a recursive solution to expand the "floating" addresses, which I think is actually fine because there will be `O(2^n)` iterations anyway, though it might take less memory doing it iteratively...

## Day 15

Data type choices matter!
I went with an array-based approach for part 1 and I was using `rindex` which does a search under the hood. Worked well for part 1, but part 2 it was no longer reasonable.
I switched to using hashmaps to store index locations in part 2 and ended up with a ~10s runtime. Not the fastest, but not worth the extra programming time to improve that...

## Day 16

The implementation was kind of fiddly, but not that tricky!
I was worried that part 2 was going to be harder than it ended up being. Every rule ended up having a very obvious destination. Since there were only 20 of them, I figured it would take ~2m to hard code and ~5m to program, so I opted to hard code it.

## Day 17

I made a choice early on, to only track active values hoping it wouldn't be an issue in part 2. This made it much easier to calculate the bounds which we are working with. The bounds calculation is slow (`o(n)` when it could be `o(1)`, but didn't cause me any issues.
I ran into a bug which proved difficult to track down. It ended up being [this](https://github.com/lwakefield/advent-of-code/blob/master/2020/day_17.cr#L26) condition in the neighbors function.
Once part 1 was working, I editted the code to add an extra dimension and re-ran. It seemed fast enough (I have to wait for compile times anyway) for the 4d case.
Fun problem! Relatively straight forward, but lots of locations for bugs to trip you up.

## Day 18

I didn't get time to work on this yesterday, but I am glad that was the case. It turned out to be trickier than I expected.
My implementation was a rube-goldberg mess, but it did give me the answer.
However part 2, was even worse. So I broke out my ["Writing an Interpreter in Go"](https://interpreterbook.com/) book for instruction on how to write a pratt-parser. Took me a while to grok the algorithm again, but implementation wasn't so bad in the end. I might be able to condense the solution a little, but overall I am pleased with the code  and reckon it is fairly easy to follow.
[Final implementation here]( https://github.com/lwakefield/advent-of-code/blob/master/2020/day_18.cr). You can check the commit history for part 1, but  it is nothing to be proud of...

## Day 19

Pretty pleased with how quickly I solved this one after day 18...
First I built up a tree of nodes for each of the rules. I started to think about writing a matching algorithm, but then realized that we might be able to convert it to regex and leverage that matching algorithm (which is surely better than any I can write). Lo and behold, it worked and gave me the answer for part 1!
For part 2, I went back to the idea of writing a matching function. But the instructions seemed to indicate that there was a trick here... So I looked at the two rules and identified two patterns, one of them is the equivalent of `/a+/` while the other is equivalent to `/ab|aabb|aaabbb|aaaabbbb|.../`. I did some sanity checking to make that there was no relation between the two rules that would cause problem and was pleased to find no relation.
So I set about injecting those two rules into the regex from part 1. For the `/a+/` rule, this wasn't too difficult. But for the other rule, I couldn't think of a way to implement that in regex, so I did something silly and hard coded it.

```
"(#{x}#{y}|#{x*2}#{y*2}|#{x*3}#{y*3})"
```

The algorithm worked, but wasn't sure about the correctness, so I extended it one more:

```
"(#{x}#{y}|#{x*2}#{y*2}|#{x*3}#{y*3}|#{x*4}#{y*4})"
```

The answer changed. So I figured "I'll just keep extending until the answer stops changing". However:

```
Unhandled exception: regular expression is too large at 23345 (ArgumentError)
  from ../../../../../usr/share/crystal/src/regex.cr:257:5 in 'initialize'
  from ../../../../../usr/share/crystal/src/regex.cr:251:3 in 'new'
  from day_19.cr:37:5 in 'to_rgx'
  from day_19.cr:77:1 in '__crystal_main'
  from ../../../../../usr/share/crystal/src/crystal/main.cr:105:5 in 'main_user_code'
  from ../../../../../usr/share/crystal/src/crystal/main.cr:91:7 in 'main'
  from ../../../../../usr/share/crystal/src/crystal/main.cr:114:3 in 'main'
  from __libc_start_main
  from _start
```

Bummer. So I punched in the previous answer in hopes that it would be correct... and it was. My lucky day.
