"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PostItem {
  id: string;
  content: string;
  platform: string;
  likes: number;
  comments: number;
  reach: number;
  engagementRate: number;
  type: string;
}

interface BestPostsTableProps {
  posts: PostItem[];
}

export default function BestPostsTable({ posts }: BestPostsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Performing Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right">Reach</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No posts found yet
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-[260px] truncate">
                    {post.content}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.platform}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{post.type}</TableCell>
                  <TableCell className="text-right">{post.likes}</TableCell>
                  <TableCell className="text-right">{post.comments}</TableCell>
                  <TableCell className="text-right">{post.reach}</TableCell>
                  <TableCell className="text-right font-medium">
                    {post.engagementRate}%
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}