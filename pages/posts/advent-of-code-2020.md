title: Advent of Code 2020
published: 2020/12/19

---

Find all of my solutions [here](https://github.com/lwakefield/advent-of-code/tree/master/2020). 

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
I did not add validation on the row_start == row_end, so I suppose if the dataset was messier that would have cost me.
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
